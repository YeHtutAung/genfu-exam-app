import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const FIELDS = 'id, type, title_jp, body_jp, message_key, message_params, action_url, read_at, created_at, sent_at'

export default function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(Boolean(userId))
  const [error, setError] = useState(null)

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('notifications')
      .select(FIELDS)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (fetchError) setError(fetchError)
    else {
      setNotifications(data || [])
      setError(null)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchNotifications()
    if (!userId) return undefined

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        fetchNotifications,
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchNotifications, userId])

  const markRead = useCallback(async id => {
    const readAt = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read_at: readAt })
      .eq('id', id)
      .eq('user_id', userId)
      .is('read_at', null)
    if (updateError) throw updateError
    setNotifications(items => items.map(item => item.id === id ? { ...item, read_at: item.read_at || readAt } : item))
  }, [userId])

  const markAllRead = useCallback(async () => {
    const readAt = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read_at: readAt })
      .eq('user_id', userId)
      .is('read_at', null)
    if (updateError) throw updateError
    setNotifications(items => items.map(item => ({ ...item, read_at: item.read_at || readAt })))
  }, [userId])

  const unreadCount = useMemo(() => notifications.filter(item => !item.read_at).length, [notifications])

  return { notifications, unreadCount, loading, error, markRead, markAllRead }
}
