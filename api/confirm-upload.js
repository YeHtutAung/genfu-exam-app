import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { success: false, error: 'Server misconfigured' })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  let body
  try {
    body = await req.json()
  } catch {
    return json(400, { success: false, error: 'Invalid JSON' })
  }

  const { meta, questions, imagesBase64, categoryId } = body

  if (!meta || !questions || !categoryId) {
    return json(400, { success: false, error: 'Missing required fields: meta, questions, categoryId' })
  }

  try {
    // 1. Insert test row (inactive by default)
    const { data: testRow, error: testErr } = await supabase
      .from('tests')
      .insert({
        category_id: categoryId,
        test_number: meta.test_number,
        title_jp: meta.title_jp || null,
        time_limit: meta.time_limit,
        pass_score: meta.pass_score,
        total_points: meta.total_points,
        active: false,
      })
      .select()
      .single()

    if (testErr) {
      console.error('Insert test error:', testErr)
      return json(500, { success: false, error: `Failed to create test: ${testErr.message}` })
    }

    const testId = testRow.id
    const category = meta.category
    let imagesUploaded = 0

    // 2. Upload images to Supabase Storage
    const imageUrlMap = {} // filename → public URL
    if (imagesBase64 && Object.keys(imagesBase64).length > 0) {
      for (const [filename, base64Data] of Object.entries(imagesBase64)) {
        const binary = base64ToUint8(base64Data)
        const storagePath = `${category}/${testId}/${filename}`

        const { error: uploadErr } = await supabase.storage
          .from('exam-images')
          .upload(storagePath, binary, {
            contentType: 'image/png',
            upsert: true,
          })

        if (uploadErr) {
          console.error(`Upload image ${filename} error:`, uploadErr)
          continue
        }

        const { data: urlData } = supabase.storage
          .from('exam-images')
          .getPublicUrl(storagePath)

        imageUrlMap[filename] = urlData.publicUrl
        imagesUploaded++
      }
    }

    // 3. Insert questions
    const questionRows = []
    const subQuestionRows = []

    for (const q of questions) {
      // Resolve image fields
      let imageRender = null
      let signCode = null
      let imageUrl = null
      let imageAlt = null

      if (q.image) {
        if (q.image.render === 'css') {
          imageRender = 'css'
          signCode = q.image.sign_code || null
        } else if (q.image.render === 'static') {
          imageRender = 'static'
          imageAlt = q.image.alt || null
          // Resolve filename to uploaded URL
          const imgFilename = q.image.src?.split('/').pop()
          if (imgFilename && imageUrlMap[imgFilename]) {
            imageUrl = imageUrlMap[imgFilename]
          }
        }
      }

      questionRows.push({
        test_id: testId,
        question_number: q.question_number,
        type: q.type,
        question_jp: q.question_jp,
        answer: q.type === 'standard' ? q.answer : null,
        hint_jp: q.hint_jp || null,
        points: q.points,
        image_render: imageRender,
        sign_code: signCode,
        image_url: imageUrl,
        image_alt: imageAlt,
      })

      // Collect sub_questions to insert after we have question IDs
      if (q.type === 'scenario' && q.sub_questions) {
        subQuestionRows.push({
          questionNumber: q.question_number,
          subs: q.sub_questions,
        })
      }
    }

    const { data: insertedQuestions, error: qErr } = await supabase
      .from('questions')
      .insert(questionRows)
      .select('id, question_number')

    if (qErr) {
      console.error('Insert questions error:', qErr)
      // Rollback: delete the test (cascades to questions)
      await supabase.from('tests').delete().eq('id', testId)
      return json(500, { success: false, error: `Failed to insert questions: ${qErr.message}` })
    }

    // 4. Insert sub_questions
    if (subQuestionRows.length > 0) {
      // Build a map from question_number → inserted question id
      const qIdMap = {}
      for (const iq of insertedQuestions) {
        qIdMap[iq.question_number] = iq.id
      }

      const subRows = []
      for (const { questionNumber, subs } of subQuestionRows) {
        const parentId = qIdMap[questionNumber]
        if (!parentId) continue
        for (const sq of subs) {
          subRows.push({
            question_id: parentId,
            sub_number: sq.sub_number,
            text_jp: sq.text_jp,
            answer: sq.answer,
          })
        }
      }

      const { error: sqErr } = await supabase
        .from('sub_questions')
        .insert(subRows)

      if (sqErr) {
        console.error('Insert sub_questions error:', sqErr)
        // Rollback
        await supabase.from('tests').delete().eq('id', testId)
        return json(500, { success: false, error: `Failed to insert sub_questions: ${sqErr.message}` })
      }
    }

    return json(200, {
      success: true,
      testId,
      questionsInserted: insertedQuestions.length,
      imagesUploaded,
    })
  } catch (err) {
    console.error('confirm-upload error:', err)
    return json(500, { success: false, error: 'Internal server error' })
  }
}

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function base64ToUint8(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
