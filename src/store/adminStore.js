import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAdminStore = create((set, get) => ({
  // Dashboard stats
  stats: null,
  statsLoading: false,
  statsError: null,

  // Tests management
  tests: [],
  categories: [],
  testsLoading: false,
  testsError: null,

  // Users management
  users: [],
  usersLoading: false,
  usersError: null,

  // Upload pipeline — flows from Upload page to UploadPreview page
  uploadPreview: null,

  fetchStats: async () => {
    set({ statsLoading: true, statsError: null })
    const [users, tests, sessions] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('tests').select('id', { count: 'exact', head: true }),
      supabase.from('exam_sessions').select('id', { count: 'exact', head: true }),
    ])
    if (users.error || tests.error || sessions.error) {
      set({ statsError: 'データの取得に失敗しました', statsLoading: false })
      return
    }
    set({
      stats: {
        users: users.count ?? 0,
        tests: tests.count ?? 0,
        sessions: sessions.count ?? 0,
      },
      statsLoading: false,
    })
  },

  fetchTests: async () => {
    set({ testsLoading: true, testsError: null })
    const [catRes, testRes] = await Promise.all([
      supabase.from('categories').select('*').order('code'),
      supabase.from('tests').select('*, questions(id)').order('test_number'),
    ])
    if (catRes.error || testRes.error) {
      set({ testsError: 'データの取得に失敗しました', testsLoading: false })
      return
    }
    const tests = (testRes.data || []).map(t => ({
      ...t,
      question_count: t.questions?.length ?? 0,
    }))
    set({ categories: catRes.data || [], tests, testsLoading: false })
  },

  fetchUsers: async () => {
    set({ usersLoading: true, usersError: null })
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (pErr) {
      set({ usersError: 'データの取得に失敗しました', usersLoading: false })
      return
    }
    const { data: sessions, error: sErr } = await supabase
      .from('exam_sessions')
      .select('user_id, score')
      .eq('mode', 'exam')
      .not('score', 'is', null)
    if (sErr) {
      set({ usersError: 'セッションデータの取得に失敗しました', usersLoading: false })
      return
    }
    const statsMap = {}
    for (const s of sessions || []) {
      if (!statsMap[s.user_id]) statsMap[s.user_id] = { count: 0, best: null }
      statsMap[s.user_id].count++
      if (statsMap[s.user_id].best === null || s.score > statsMap[s.user_id].best) {
        statsMap[s.user_id].best = s.score
      }
    }
    const users = (profiles || []).map(p => ({
      ...p,
      exam_count: statsMap[p.id]?.count ?? 0,
      best_score: statsMap[p.id]?.best ?? null,
    }))
    set({ users, usersLoading: false })
  },

  toggleTestActive: async (testId, active) => {
    const { error } = await supabase.from('tests').update({ active }).eq('id', testId)
    if (error) {
      set({ testsError: 'テストの更新に失敗しました' })
      return
    }
    await get().fetchTests()
  },

  deleteTest: async (testId) => {
    const { error } = await supabase.from('tests').delete().eq('id', testId)
    if (error) {
      set({ testsError: 'テストの削除に失敗しました' })
      return
    }
    await get().fetchTests()
  },

  setUploadPreview: (payload) => set({ uploadPreview: payload }),
  clearUploadPreview: () => set({ uploadPreview: null }),
}))

export default useAdminStore
