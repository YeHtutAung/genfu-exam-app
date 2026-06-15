import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return { supabase: null, error: 'Server misconfigured' }
  }

  return {
    supabase: createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    }),
    error: null,
  }
}

export async function requireAdmin(req, supabase) {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''

  if (!token) {
    return { ok: false, status: 401, error: 'Authentication required' }
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  const user = userData?.user

  if (userError || !user) {
    return { ok: false, status: 401, error: 'Invalid session' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    return { ok: false, status: 403, error: 'Admin access required' }
  }

  return { ok: true, user }
}
