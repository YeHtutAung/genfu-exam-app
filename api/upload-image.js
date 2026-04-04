import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'edge' }

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB

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

  let formData
  try {
    formData = await req.formData()
  } catch {
    return json(400, { success: false, error: 'Invalid form data' })
  }

  const questionId = formData.get('questionId')
  const file = formData.get('image')

  if (!questionId || !file || !(file instanceof File)) {
    return json(400, { success: false, error: 'Missing questionId or image file' })
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return json(400, { success: false, error: 'Image exceeds 5MB limit' })
  }

  try {
    // Fetch question to get test info
    const { data: question, error: qErr } = await supabase
      .from('questions')
      .select('id, test_id')
      .eq('id', questionId)
      .single()

    if (qErr || !question) {
      return json(404, { success: false, error: 'Question not found' })
    }

    // Fetch test to get category
    const { data: test, error: tErr } = await supabase
      .from('tests')
      .select('id, category_id')
      .eq('id', question.test_id)
      .single()

    if (tErr || !test) {
      return json(404, { success: false, error: 'Test not found' })
    }

    // Fetch category code
    const { data: category } = await supabase
      .from('categories')
      .select('code')
      .eq('id', test.category_id)
      .single()

    const categoryCode = category?.code || 'unknown'
    const filename = file.name || 'image.png'
    const storagePath = `${categoryCode}/${test.id}/${filename}`

    // Upload to Supabase Storage
    const buffer = new Uint8Array(await file.arrayBuffer())
    const { error: uploadErr } = await supabase.storage
      .from('exam-images')
      .upload(storagePath, buffer, {
        contentType: file.type || 'image/png',
        upsert: true,
      })

    if (uploadErr) {
      console.error('Upload error:', uploadErr)
      return json(500, { success: false, error: `Upload failed: ${uploadErr.message}` })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('exam-images')
      .getPublicUrl(storagePath)

    const publicUrl = urlData.publicUrl

    // Update question record
    const { error: updateErr } = await supabase
      .from('questions')
      .update({
        image_render: 'static',
        image_url: publicUrl,
        image_alt: formData.get('imageAlt') || filename,
      })
      .eq('id', questionId)

    if (updateErr) {
      console.error('Update question error:', updateErr)
      return json(500, { success: false, error: `DB update failed: ${updateErr.message}` })
    }

    return json(200, { success: true, imageUrl: publicUrl })
  } catch (err) {
    console.error('upload-image error:', err)
    return json(500, { success: false, error: 'Internal server error' })
  }
}

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
