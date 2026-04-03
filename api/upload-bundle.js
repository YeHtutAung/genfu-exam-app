import { unzipSync } from 'fflate'

export const config = { runtime: 'edge' }

const MAX_ZIP_SIZE = 50 * 1024 * 1024   // 50 MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5 MB

const REQUIRED_META = ['test_id', 'category', 'test_number', 'time_limit', 'pass_score', 'total_points']
const REQUIRED_QUESTION = ['id', 'question_number', 'type', 'points']

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('bundle')

    if (!file || !(file instanceof File)) {
      return json(400, { valid: false, errors: ['No ZIP file provided'] })
    }

    if (file.size > MAX_ZIP_SIZE) {
      return json(400, { valid: false, errors: [`ZIP exceeds ${MAX_ZIP_SIZE / 1024 / 1024}MB limit`] })
    }

    // Read ZIP into buffer and extract
    const buffer = new Uint8Array(await file.arrayBuffer())
    let entries
    try {
      entries = unzipSync(buffer)
    } catch {
      return json(400, { valid: false, errors: ['Invalid or corrupted ZIP file'] })
    }

    // Find JSON file at root level
    const jsonFiles = Object.keys(entries).filter(
      name => !name.includes('/') && name.endsWith('.json')
    )

    if (jsonFiles.length === 0) {
      return json(400, { valid: false, errors: ['No JSON file found at ZIP root'] })
    }
    if (jsonFiles.length > 1) {
      return json(400, { valid: false, errors: ['ZIP must contain exactly one JSON file at root'] })
    }

    // Parse JSON
    let testData
    try {
      const jsonText = new TextDecoder().decode(entries[jsonFiles[0]])
      testData = JSON.parse(jsonText)
    } catch {
      return json(400, { valid: false, errors: ['JSON file is not valid JSON'] })
    }

    // Collect PNG images from /images/ subfolder
    const images = {}
    for (const [path, data] of Object.entries(entries)) {
      const normalized = path.replace(/\\/g, '/')
      if (normalized.startsWith('images/') && normalized.endsWith('.png')) {
        const filename = normalized.split('/').pop()
        if (data.length > MAX_IMAGE_SIZE) {
          return json(400, { valid: false, errors: [`Image ${filename} exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit`] })
        }
        images[filename] = data
      }
    }

    // Validate schema
    const errors = []
    const warnings = []

    // Validate meta
    const { meta, questions } = testData
    if (!meta) {
      errors.push('Missing "meta" field')
      return json(400, { valid: false, errors })
    }

    for (const field of REQUIRED_META) {
      if (meta[field] === undefined || meta[field] === null) {
        errors.push(`Missing meta.${field}`)
      }
    }

    if (!questions || !Array.isArray(questions)) {
      errors.push('Missing or invalid "questions" array')
      return json(400, { valid: false, errors })
    }

    // Validate questions
    const questionIds = new Set()
    let pointsTotal = 0
    let standardCount = 0
    let scenarioCount = 0
    let cssImageCount = 0
    let staticImageCount = 0

    for (const q of questions) {
      for (const field of REQUIRED_QUESTION) {
        if (q[field] === undefined || q[field] === null) {
          errors.push(`Question ${q.question_number ?? '?'}: missing ${field}`)
        }
      }

      // Duplicate ID check
      if (q.id) {
        if (questionIds.has(q.id)) {
          errors.push(`Duplicate question ID: ${q.id}`)
        }
        questionIds.add(q.id)
      }

      if (q.type === 'standard') {
        standardCount++
        if (q.answer === undefined || q.answer === null) {
          errors.push(`Question ${q.question_number}: standard type must have "answer"`)
        }
      } else if (q.type === 'scenario') {
        scenarioCount++
        if (!q.sub_questions || q.sub_questions.length !== 3) {
          errors.push(`Question ${q.question_number}: scenario must have exactly 3 sub_questions`)
        }
      }

      // Image validation
      if (q.image) {
        if (q.image.render === 'css') {
          cssImageCount++
        } else if (q.image.render === 'static') {
          staticImageCount++
          const src = q.image.src
          if (src) {
            // Extract filename from path like "/assets/q03_fig_04.png"
            const imgFilename = src.split('/').pop()
            if (!images[imgFilename]) {
              errors.push(`Question ${q.question_number}: image "${imgFilename}" not found in ZIP /images/`)
            }
          }
        }
      }

      pointsTotal += q.points ?? 0
    }

    // Validate points total
    if (meta.total_points && pointsTotal !== meta.total_points) {
      errors.push(`Points total mismatch: questions sum to ${pointsTotal}, meta says ${meta.total_points}`)
    }

    if (errors.length > 0) {
      return json(400, { valid: false, errors, warnings })
    }

    // Build image info for preview
    const imageInfo = Object.entries(images).map(([filename, data]) => {
      // Find which question references this image
      const matchedQ = questions.find(q =>
        q.image?.src?.endsWith(filename)
      )
      return {
        filename,
        size: data.length,
        matchedQuestionId: matchedQ?.id ?? null,
      }
    })

    // Encode images as base64 for the confirm step
    const imagesBase64 = {}
    for (const [filename, data] of Object.entries(images)) {
      imagesBase64[filename] = uint8ToBase64(data)
    }

    // Generate a bundle ID
    const bundleId = crypto.randomUUID()

    return json(200, {
      valid: true,
      bundleId,
      meta,
      questions: testData.questions,
      summary: {
        total: questions.length,
        standard: standardCount,
        scenario: scenarioCount,
        cssImages: cssImageCount,
        staticImages: staticImageCount,
      },
      images: imageInfo,
      imagesBase64,
      errors: [],
      warnings,
    })
  } catch (err) {
    console.error('upload-bundle error:', err)
    return json(500, { valid: false, errors: ['Internal server error'] })
  }
}

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function uint8ToBase64(uint8) {
  let binary = ''
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i])
  }
  return btoa(binary)
}
