import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { deleteTest as deleteTestApi } from '../lib/api'
import { calculateReadiness } from '../lib/readiness'

const LOAD_ERROR = 'signal.loadError'

const useAdminStore = create((set, get) => ({
  // Dashboard stats
  stats: null,
  statsLoading: false,
  statsError: null,

  // Tests management
  tests: null,
  categories: [],
  testsLoading: false,
  testsError: null,

  // Users management
  users: null,
  usersLoading: false,
  usersError: null,

  // User readiness analytics
  analytics: null,
  analyticsLoading: false,
  analyticsError: null,

  // Upload pipeline - flows from Upload page to UploadPreview page
  uploadPreview: null,

  fetchStats: async () => {
    set({ statsLoading: true, statsError: null })
    const [users, tests, sessions, activeTests, completedSessions] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('tests').select('id', { count: 'exact', head: true }),
      supabase.from('exam_sessions').select('id', { count: 'exact', head: true }),
      supabase.from('tests').select('id', { count: 'exact', head: true }).eq('active', true),
      supabase
        .from('exam_sessions')
        .select('id, test_id, mode, score, passed, completed_at, tests(id, test_number, title_jp, title_en, title_my, total_points, active)')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(500),
    ])

    if (users.error || tests.error || sessions.error || activeTests.error || completedSessions.error) {
      set({ statsError: LOAD_ERROR, statsLoading: false })
      return
    }

    const completed = completedSessions.data || []
    const examSessions = completed.filter(s => s.mode === 'exam')
    const passedAttempts = examSessions.filter(s => s.passed).length
    const passRate = examSessions.length > 0
      ? Math.round((passedAttempts / examSessions.length) * 100)
      : 0

    const testMap = {}
    for (const session of examSessions) {
      const testId = session.test_id
      if (!testMap[testId]) {
        testMap[testId] = {
          test_id: testId,
          test_number: session.tests?.test_number,
          title_jp: session.tests?.title_jp,
          title_en: session.tests?.title_en,
          title_my: session.tests?.title_my,
          attempts: 0,
          passed: 0,
          totalScorePercent: 0,
          latest_at: session.completed_at,
        }
      }

      const entry = testMap[testId]
      const totalPoints = session.tests?.total_points || 50
      entry.attempts++
      if (session.passed) entry.passed++
      entry.totalScorePercent += typeof session.score === 'number'
        ? Math.round((session.score / totalPoints) * 100)
        : 0
      if (new Date(session.completed_at) > new Date(entry.latest_at)) {
        entry.latest_at = session.completed_at
      }
    }

    const testPerformance = Object.values(testMap)
      .map(test => ({
        ...test,
        passRate: test.attempts > 0 ? Math.round((test.passed / test.attempts) * 100) : 0,
        averageScore: test.attempts > 0 ? Math.round(test.totalScorePercent / test.attempts) : 0,
      }))
      .sort((a, b) => {
        if (a.passRate !== b.passRate) return a.passRate - b.passRate
        return b.attempts - a.attempts
      })
      .slice(0, 5)

    const recentAttempts = completed.slice(0, 6).map(session => ({
      id: session.id,
      mode: session.mode,
      score: session.score,
      passed: session.passed,
      completed_at: session.completed_at,
      test_number: session.tests?.test_number,
      title_jp: session.tests?.title_jp,
      title_en: session.tests?.title_en,
      title_my: session.tests?.title_my,
    }))

    set({
      stats: {
        users: users.count ?? 0,
        tests: tests.count ?? 0,
        activeTests: activeTests.count ?? 0,
        sessions: sessions.count ?? 0,
        completedSessions: completed.length,
        examAttempts: examSessions.length,
        passRate,
        recentAttempts,
        testPerformance,
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
      set({ testsError: LOAD_ERROR, testsLoading: false })
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
      set({ usersError: LOAD_ERROR, usersLoading: false })
      return
    }
    const { data: sessions, error: sErr } = await supabase
      .from('exam_sessions')
      .select('user_id, score')
      .eq('mode', 'exam')
      .not('score', 'is', null)
    if (sErr) {
      set({ usersError: 'signal.sessionLoadError', usersLoading: false })
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

  fetchAnalytics: async () => {
    set({ analyticsLoading: true, analyticsError: null })
    const [profilesRes, testsRes, sessionsRes] = await Promise.all([
      supabase.from('profiles').select('id, email, role, created_at').order('created_at', { ascending: false }),
      supabase.from('tests').select('id, test_number, title_jp, title_en, title_my, total_points').eq('active', true).order('test_number'),
      supabase.from('exam_sessions').select('id, user_id, test_id, mode, score, passed, completed_at').not('completed_at', 'is', null),
    ])
    if (profilesRes.error || testsRes.error || sessionsRes.error) {
      set({ analyticsError: LOAD_ERROR, analyticsLoading: false })
      return
    }
    const tests = testsRes.data || []
    const sessions = sessionsRes.data || []
    const testMap = new Map(tests.map(test => [test.id, test]))
    const analytics = (profilesRes.data || []).map(profile => {
      const userSessions = sessions.filter(session => session.user_id === profile.id)
      const metrics = calculateReadiness({ tests, sessions: userSessions })
      const examSessions = userSessions.filter(session => session.mode === 'exam')
      const byTest = new Map()
      for (const session of examSessions) {
        const test = testMap.get(session.test_id)
        if (!test || typeof session.score !== 'number') continue
        const current = byTest.get(test.id) || { test, total: 0, count: 0 }
        current.total += (session.score / (test.total_points || 50)) * 100
        current.count++
        byTest.set(test.id, current)
      }
      const weakest = [...byTest.values()].sort((a, b) => (a.total / a.count) - (b.total / b.count))[0]?.test
      return { ...profile, ...metrics, weakestTest: weakest || null }
    })
    set({ analytics, analyticsLoading: false })
  },

  sendGuidance: async (userId, title, message) => {
    const { error } = await supabase.from('notifications').insert({ user_id: userId, type: 'readiness_guidance', title_jp: title, body_jp: message })
    if (error) throw error
  },

  toggleTestActive: async (testId, active) => {
    const { error } = await supabase.from('tests').update({ active }).eq('id', testId)
    if (error) {
      set({ testsError: 'signal.testUpdateError' })
      return
    }
    await get().fetchTests()
  },

  deleteTest: async (testId) => {
    try {
      await deleteTestApi(testId)
    } catch (err) {
      set({ testsError: err.message || 'signal.testDeleteError' })
      return
    }
    await get().fetchTests()
  },

  setUploadPreview: (payload) => set({ uploadPreview: payload }),
  clearUploadPreview: () => set({ uploadPreview: null }),
}))

export default useAdminStore
