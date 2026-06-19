import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'

export default function useBookmark(questionId) {
  const user = useAuthStore(s => s.user)
  const [bookmarkId, setBookmarkId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      if (!user?.id || !questionId) {
        setBookmarkId(null)
        return
      }

      setLoading(true)
      const { data, error } = await supabase
        .from('question_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle()

      if (!active) return

      if (error) {
        setAvailable(false)
        setBookmarkId(null)
      } else {
        setAvailable(true)
        setBookmarkId(data?.id ?? null)
      }
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [questionId, user?.id])

  const toggle = useCallback(async () => {
    if (!available || !user?.id || !questionId || loading) return

    setLoading(true)
    if (bookmarkId) {
      const { error } = await supabase
        .from('question_bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', user.id)

      if (!error) setBookmarkId(null)
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('question_bookmarks')
      .insert({ user_id: user.id, question_id: questionId })
      .select('id')
      .single()

    if (!error) {
      setBookmarkId(data.id)
      setAvailable(true)
    } else {
      setAvailable(false)
    }
    setLoading(false)
  }, [available, bookmarkId, loading, questionId, user?.id])

  return {
    bookmarked: !!bookmarkId,
    loading,
    available,
    toggle,
  }
}
