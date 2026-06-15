import { createServiceClient, requireAdmin } from './_admin-auth.js'

export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return json(405, { success: false, error: 'Method not allowed' })
  }

  const { supabase, error: configError } = createServiceClient()
  if (configError) {
    return json(500, { success: false, error: configError })
  }

  const admin = await requireAdmin(req, supabase)
  if (!admin.ok) {
    return json(admin.status, { success: false, error: admin.error })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return json(400, { success: false, error: 'Invalid JSON' })
  }

  const testId = body?.testId
  if (!testId) {
    return json(400, { success: false, error: 'Missing testId' })
  }

  try {
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('id, category_id, categories(code)')
      .eq('id', testId)
      .single()

    if (testError || !test) {
      return json(404, { success: false, error: 'Test not found' })
    }

    const { error: sessionError } = await supabase
      .from('exam_sessions')
      .delete()
      .eq('test_id', testId)

    if (sessionError) {
      return json(500, { success: false, error: `Failed to delete sessions: ${sessionError.message}` })
    }

    const { error: deleteError } = await supabase
      .from('tests')
      .delete()
      .eq('id', testId)

    if (deleteError) {
      return json(500, { success: false, error: `Failed to delete test: ${deleteError.message}` })
    }

    await removeTestImages(supabase, test.categories?.code, testId)

    return json(200, { success: true })
  } catch (err) {
    console.error('delete-test error:', err)
    return json(500, { success: false, error: 'Internal server error' })
  }
}

async function removeTestImages(supabase, categoryCode, testId) {
  if (!categoryCode) return

  const prefix = `${categoryCode}/${testId}`
  const { data } = await supabase.storage.from('exam-images').list(prefix)
  const paths = (data || []).filter(item => item.name).map(item => `${prefix}/${item.name}`)

  if (paths.length > 0) {
    await supabase.storage.from('exam-images').remove(paths)
  }
}

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
