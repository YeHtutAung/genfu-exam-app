import { createServiceClient, requireAdmin } from './_admin-auth.js'

export const config = { runtime: 'edge' }

const VALID_BANDS = new Set(['ready', 'almost', 'needs'])

export default async function handler(req) {
  if (req.method !== 'POST') return json(405, { success: false, error: 'Method not allowed' })

  const { supabase, error: configError } = createServiceClient()
  if (configError) return json(500, { success: false, error: configError })

  const admin = await requireAdmin(req, supabase)
  if (!admin.ok) return json(admin.status, { success: false, error: admin.error })

  let body
  try {
    body = await req.json()
  } catch {
    return json(400, { success: false, error: 'Invalid JSON' })
  }

  const userId = body?.userId
  const band = body?.band
  const weakestTestId = body?.weakestTestId || null
  if (!userId || !VALID_BANDS.has(band)) {
    return json(400, { success: false, error: 'Invalid userId or readiness band' })
  }

  const { data: recipient, error: recipientError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('id', userId)
    .single()
  if (recipientError || !recipient) return json(404, { success: false, error: 'User not found' })

  let weakestTest = null
  if (weakestTestId) {
    const { data } = await supabase
      .from('tests')
      .select('id, test_number, title_jp, title_en, title_my')
      .eq('id', weakestTestId)
      .single()
    weakestTest = data || null
  }

  const messageKey = band === 'ready'
    ? 'signal.guidanceReady'
    : band === 'almost'
      ? 'signal.guidanceAlmost'
      : 'signal.guidanceNeeds'
  const messageParams = weakestTest ? { test: weakestTest } : {}
  const actionUrl = band === 'almost' && weakestTest?.id ? `/study/${weakestTest.id}` : band === 'ready' ? '/tips' : '/'
  const testLabel = weakestTest?.title_jp || (weakestTest?.test_number ? `第${weakestTest.test_number}回` : '対象テスト')
  const legacyBody = band === 'ready'
    ? '安定して合格。本番試験の予約をすすめる。'
    : band === 'almost'
      ? `${testLabel}が弱点。学習モードで復習してから再挑戦。`
      : '基礎が不安定。学習モードで標識・徐行を重点復習。'
  const day = new Date().toISOString().slice(0, 10)
  const dedupeKey = `${userId}:readiness:${band}:${weakestTest?.id || 'none'}:${day}`

  const payload = {
    user_id: userId,
    created_by: admin.user.id,
    type: 'readiness_guidance',
    title_jp: '試験準備度のご案内',
    body_jp: legacyBody,
    message_key: messageKey,
    message_params: messageParams,
    action_url: actionUrl,
    dedupe_key: dedupeKey,
  }

  const { data: notification, error: insertError } = await supabase
    .from('notifications')
    .insert(payload)
    .select('id, user_id, read_at, sent_at, created_at, action_url')
    .single()

  if (insertError?.code === '23505') {
    const { data: existing } = await supabase
      .from('notifications')
      .select('id, user_id, read_at, sent_at, created_at, action_url')
      .eq('dedupe_key', dedupeKey)
      .single()
    return json(200, { success: true, duplicate: true, notification: existing })
  }
  if (insertError) {
    console.error('send-guidance insert error:', insertError)
    return json(500, { success: false, error: 'Failed to create guidance notification' })
  }

  return json(201, { success: true, duplicate: false, notification })
}

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
