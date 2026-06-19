import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

const INITIAL_STATE = {
  testMeta: null,    // { id, time_limit, pass_score, total_points, title_jp }
  questions: [],     // full question objects with sub_questions embedded
  currentIndex: 0,
  answers: {},       // { questionId: boolean } for standard, { subQuestionId: boolean } for scenario
  mode: null,        // 'exam' | 'study'
  variant: 'standard',
  sessionId: null,
  startTime: null,
  timeRemaining: 0,  // seconds
  completed: false,
  score: null,
  passed: null,
  submitting: false,
  submitError: null,
  loading: false,
  error: null,
}

const useExamStore = create(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // ── Load & start ──────────────────────────────────────────────

      startExam: async (testId, mode, options = {}) => {
        const variant = options.variant ?? 'standard'
        const current = get()
        const isResuming =
          !current.completed &&
          current.sessionId &&
          current._testId === testId &&
          current.mode === mode &&
          current.variant === variant

        if (!isResuming) {
          set({ ...INITIAL_STATE, loading: true, mode, variant, _testId: testId })
        } else {
          set({ loading: true })
        }

        // Always fetch fresh questions from DB
        const { data: test, error: testError } = await supabase
          .from('tests')
          .select('*')
          .eq('id', testId)
          .single()

        if (testError) {
          set({ loading: false, error: testError.message })
          return
        }

        const { data: questions, error: qError } = await supabase
          .from('questions')
          .select('*, sub_questions(*)')
          .eq('test_id', testId)
          .order('question_number')

        if (qError) {
          set({ loading: false, error: qError.message })
          return
        }

        // Sort sub_questions by sub_number
        let sorted = questions.map(q => ({
          ...q,
          sub_questions: (q.sub_questions || []).sort((a, b) => a.sub_number - b.sub_number),
          image: q.image_render
            ? {
                render: q.image_render,
                sign_code: q.sign_code,
                src: q.image_url,
                alt: q.image_alt,
              }
            : null,
        }))

        if (variant === 'simulation') {
          sorted = [...sorted].sort(() => Math.random() - 0.5)
        }

        if (isResuming) {
          // Resume: update questions + test meta, keep answers/index/session
          const resumeState = { testMeta: test, questions: sorted, loading: false }
          if (mode === 'exam' && current.startTime) {
            const elapsed = Math.floor((Date.now() - current.startTime) / 1000)
            const remaining = Math.max(0, test.time_limit - elapsed)
            if (remaining <= 0) {
              set({ ...resumeState })
              get().completeExam()
              return
            }
            resumeState.timeRemaining = remaining
          }
          set(resumeState)
          return
        }

        // New session: create in DB
        const userId = (await supabase.auth.getUser()).data.user?.id
        const { data: session, error: sError } = await supabase
          .from('exam_sessions')
          .insert({
            user_id: userId,
            test_id: testId,
            mode,
          })
          .select()
          .single()

        if (sError) {
          set({ loading: false, error: sError.message })
          return
        }

        set({
          testMeta: test,
          questions: sorted,
          sessionId: session.id,
          _testId: testId,
          variant,
          startTime: Date.now(),
          timeRemaining: mode === 'exam' ? test.time_limit : 0,
          loading: false,
        })
      },

      // ── Answer actions ────────────────────────────────────────────

      answerQuestion: (questionId, answer) => {
        set(s => ({
          answers: { ...s.answers, [questionId]: answer },
        }))
      },

      answerSubQuestion: (subQuestionId, answer) => {
        set(s => ({
          answers: { ...s.answers, [subQuestionId]: answer },
        }))
      },

      // ── Navigation ────────────────────────────────────────────────

      goToQuestion: (index) => {
        set({ currentIndex: index })
      },

      nextQuestion: () => {
        set(s => ({
          currentIndex: Math.min(s.currentIndex + 1, s.questions.length - 1),
        }))
      },

      prevQuestion: () => {
        set(s => ({
          currentIndex: Math.max(s.currentIndex - 1, 0),
        }))
      },

      // ── Timer ─────────────────────────────────────────────────────

      tick: () => {
        const { timeRemaining } = get()
        if (timeRemaining <= 1) {
          get().completeExam()
        } else {
          set({ timeRemaining: timeRemaining - 1 })
        }
      },

      // ── Scoring & completion ──────────────────────────────────────

      calculateScore: () => {
        const { questions, answers } = get()
        let score = 0

        for (const q of questions) {
          if (q.type === 'standard') {
            if (answers[q.id] === q.answer) {
              score += q.points
            }
          } else if (q.type === 'scenario') {
            // All 3 sub_questions must be correct for 2 points, else 0
            const allCorrect = q.sub_questions.every(
              sq => answers[sq.id] === sq.answer
            )
            if (allCorrect) {
              score += q.points
            }
          }
        }

        return score
      },

      completeExam: async () => {
        const { completed, sessionId, testMeta, questions, answers } = get()
        if (completed || get().submitting) return { ok: true }

        if (!sessionId || !testMeta) {
          const message = 'Session is not ready. Please reload and try again.'
          set({ submitError: message })
          return { ok: false, error: message }
        }

        const score = get().calculateScore()
        const passed = score >= testMeta.pass_score
        set({ submitting: true, submitError: null })

        try {
          // Build answer rows
          const answerRows = []
          for (const q of questions) {
            if (q.type === 'standard') {
              answerRows.push({
                session_id: sessionId,
                question_id: q.id,
                sub_question_id: null,
                user_answer: answers[q.id] ?? null,
                is_correct: answers[q.id] === q.answer,
              })
            } else if (q.type === 'scenario') {
              for (const sq of q.sub_questions) {
                answerRows.push({
                  session_id: sessionId,
                  question_id: q.id,
                  sub_question_id: sq.id,
                  user_answer: answers[sq.id] ?? null,
                  is_correct: answers[sq.id] === sq.answer,
                })
              }
            }
          }

          const { count: existingAnswerCount, error: existingAnswerError } = await supabase
            .from('answers')
            .select('id', { count: 'exact', head: true })
            .eq('session_id', sessionId)

          if (existingAnswerError) throw existingAnswerError

          if (answerRows.length > 0 && (existingAnswerCount ?? 0) === 0) {
            const { error: answerError } = await supabase.from('answers').insert(answerRows)
            if (answerError) throw answerError
          }

          const { error: sessionError } = await supabase
            .from('exam_sessions')
            .update({
              score,
              passed,
              completed_at: new Date().toISOString(),
            })
            .eq('id', sessionId)

          if (sessionError) throw sessionError

          // Set completed AFTER DB writes finish, so Results page has data
          set({ completed: true, score, passed, submitting: false, submitError: null })
          return { ok: true, score, passed }
        } catch (err) {
          const message = err?.message || 'Failed to submit results. Please try again.'
          set({ submitting: false, submitError: message })
          return { ok: false, error: message }
        }
      },

      // ── Reset ─────────────────────────────────────────────────────

      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'genfu-exam-session',
      partialize: (state) => ({
        _testId: state._testId,
        currentIndex: state.currentIndex,
        answers: state.answers,
        mode: state.mode,
        variant: state.variant,
        sessionId: state.sessionId,
        startTime: state.startTime,
        completed: state.completed,
        score: state.score,
        passed: state.passed,
      }),
    }
  )
)

export default useExamStore
