import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

const INITIAL_STATE = {
  testMeta: null,    // { id, time_limit, pass_score, total_points, title_jp }
  questions: [],     // full question objects with sub_questions embedded
  currentIndex: 0,
  answers: {},       // { questionId: boolean } for standard, { subQuestionId: boolean } for scenario
  mode: null,        // 'exam' | 'study'
  sessionId: null,
  startTime: null,
  timeRemaining: 0,  // seconds
  completed: false,
  score: null,
  passed: null,
  loading: false,
  error: null,
}

const useExamStore = create(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // ── Load & start ──────────────────────────────────────────────

      startExam: async (testId, mode) => {
        const current = get()
        const isResuming =
          !current.completed &&
          current.sessionId &&
          current._testId === testId &&
          current.mode === mode

        if (!isResuming) {
          set({ ...INITIAL_STATE, loading: true, mode, _testId: testId })
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
        const sorted = questions.map(q => ({
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
        if (completed) return

        const score = get().calculateScore()
        const passed = score >= testMeta.pass_score

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

        // Save answers to DB first
        if (answerRows.length > 0) {
          await supabase.from('answers').insert(answerRows)
        }

        // Update session with score and completion time
        await supabase
          .from('exam_sessions')
          .update({
            score,
            passed,
            completed_at: new Date().toISOString(),
          })
          .eq('id', sessionId)

        // Set completed AFTER DB writes finish, so Results page has data
        set({ completed: true, score, passed })
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
