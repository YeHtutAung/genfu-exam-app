# Top 3 UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement registration flow, home page progress badges, and study mode completion with DB persistence.

**Architecture:** Three independent features touching auth store, home page, study flow, and ScoreCard component. Feature 3 (study completion) must land before or alongside Feature 2 (progress badges) since study badges depend on completed study sessions existing in the DB.

**Tech Stack:** React, Zustand, Supabase Auth + DB, React Router v6, Tailwind CSS, Framer Motion

**Spec:** `docs/superpowers/specs/2026-04-05-top3-ux-improvements-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/store/authStore.js` | Modify | Add `signUp` action |
| `src/pages/Login.jsx` | Modify | Add login/register toggle, confirmation message |
| `src/components/exam/ScoreCard.jsx` | Modify | Add `hideTimeTaken`, `hideCtas`, `mode` props |
| `src/pages/Study.jsx` | Modify | Add completion button logic |
| `src/pages/StudySummary.jsx` | Create | Lightweight study results page |
| `src/App.jsx` | Modify | Add StudySummary route |
| `src/pages/Home.jsx` | Modify | Add progress fetch and dynamic badges |
| `CLAUDE.md` | Modify | Update project structure and implementation status |

---

## Task 1: Add `signUp` action to authStore

**Files:**
- Modify: `src/store/authStore.js`

- [ ] **Step 1: Add signUp action**

In `src/store/authStore.js`, add the `signUp` action after the existing `signInWithEmail` action (after line 45):

```js
signUp: async (email, password) => {
  set({ error: null })
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    set({ error: error.message })
    return { error }
  }
  // If email confirmation is enabled, session will be null
  if (data.session) {
    await get().fetchProfile(data.user.id)
    set({ user: data.user, loading: false })
    return { error: null, confirmationNeeded: false }
  }
  // Email confirmation required — don't navigate or fetch profile
  return { error: null, confirmationNeeded: true }
},
```

- [ ] **Step 2: Verify the store loads without errors**

Run: `npx vite build 2>&1 | head -20`
Expected: No import or syntax errors related to authStore.

- [ ] **Step 3: Commit**

```bash
git add src/store/authStore.js
git commit -m "feat: add signUp action with email confirmation handling to authStore"
```

---

## Task 2: Add login/register toggle to Login page

**Files:**
- Modify: `src/pages/Login.jsx`

- [ ] **Step 1: Add mode state and signUp import**

At the top of the `Login` component (around line 8), add `mode` state and import `signUp`:

```jsx
const signUp = useAuthStore(s => s.signUp)

const [mode, setMode] = useState('login')
const [confirmationSent, setConfirmationSent] = useState(false)
```

- [ ] **Step 2: Update form submit handler**

Replace the `handleEmailLogin` function with a handler that branches on mode:

```jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  setSubmitting(true)
  if (mode === 'login') {
    const { error } = await signInWithEmail(email, password)
    setSubmitting(false)
    if (!error) navigate('/')
  } else {
    const { error, confirmationNeeded } = await signUp(email, password)
    setSubmitting(false)
    if (error) return
    if (confirmationNeeded) {
      setConfirmationSent(true)
    } else {
      navigate('/')
    }
  }
}
```

Update the `<form onSubmit>` to use `handleSubmit` instead of `handleEmailLogin`.

- [ ] **Step 3: Add segmented toggle UI**

Replace the welcome text section (lines 36-42) with a toggle that includes the welcome text and mode switcher:

```jsx
{/* Logo + welcome text */}
<div className="text-center">
  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-white text-2xl font-bold">
    G
  </div>
  <h1 className="mt-4 text-2xl font-bold text-text-primary text-center">
    {mode === 'login' ? 'おかえりなさい' : 'はじめまして'}
  </h1>
  <p className="mt-1 text-sm text-text-secondary text-center">
    {mode === 'login' ? 'ログインして学習を続けましょう' : 'アカウントを作成して学習を始めましょう'}
  </p>
</div>
```

Inside the form card div (before the form element), add the segmented control:

```jsx
{/* Mode toggle */}
<div className="flex rounded-xl bg-surface p-1 mb-4">
  <button
    type="button"
    onClick={() => { setMode('login'); setConfirmationSent(false) }}
    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
      mode === 'login'
        ? 'bg-primary text-white shadow-sm'
        : 'text-text-secondary hover:text-text-primary'
    }`}
  >
    ログイン
  </button>
  <button
    type="button"
    onClick={() => { setMode('register'); setConfirmationSent(false) }}
    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
      mode === 'register'
        ? 'bg-primary text-white shadow-sm'
        : 'text-text-secondary hover:text-text-primary'
    }`}
  >
    新規登録
  </button>
</div>
```

- [ ] **Step 4: Add confirmation message**

After the `{authError && ...}` block and before the `<form>`, add:

```jsx
{confirmationSent && (
  <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm p-3 mb-4">
    確認メールを送信しました。メール内のリンクをクリックしてください。
  </div>
)}
```

- [ ] **Step 5: Update submit button label**

Change the submit button text (line 87):

```jsx
{submitting ? <Spinner size="h-5 w-5" /> : (mode === 'login' ? 'ログイン' : 'アカウント作成')}
```

- [ ] **Step 6: Replace dead register link with toggle button**

Replace the bottom `<p>` section (lines 118-123) with:

```jsx
<p className="text-center text-sm text-text-secondary mt-4">
  {mode === 'login' ? (
    <>
      アカウントをお持ちでない方は{' '}
      <button onClick={() => { setMode('register'); setConfirmationSent(false) }} className="text-primary hover:text-primary-hover font-medium">
        新規登録
      </button>
    </>
  ) : (
    <>
      すでにアカウントをお持ちの方は{' '}
      <button onClick={() => { setMode('login'); setConfirmationSent(false) }} className="text-primary hover:text-primary-hover font-medium">
        ログイン
      </button>
    </>
  )}
</p>
```

- [ ] **Step 7: Verify build succeeds**

Run: `npx vite build 2>&1 | head -20`
Expected: Build succeeds with no errors.

- [ ] **Step 8: Commit**

```bash
git add src/pages/Login.jsx
git commit -m "feat: add login/register toggle with email confirmation support"
```

---

## Task 3: Add ScoreCard props for study mode reuse

**Files:**
- Modify: `src/components/exam/ScoreCard.jsx`

- [ ] **Step 1: Add new props to component signature**

Replace line 6:
```jsx
export default function ScoreCard({ score, totalPoints, passScore, passed, timeTaken, testId, correctCount, wrongCount, unansweredCount }) {
```

With:
```jsx
export default function ScoreCard({ score, totalPoints, passScore, passed, timeTaken, testId, correctCount, wrongCount, unansweredCount, hideTimeTaken = false, hideCtas = false, mode = 'exam' }) {
```

- [ ] **Step 2: Update header to support study mode**

Replace the pass/fail header block (lines 22-34) with:

```jsx
{mode === 'study' ? (
  <>
    <div className="text-4xl mb-2">📖</div>
    <h2 className="text-2xl font-bold text-primary">学習完了！</h2>
    <p className="text-sm text-text-secondary mt-1">お疲れさまでした</p>
  </>
) : passed ? (
  <>
    <div className="text-4xl mb-2">🎉</div>
    <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">合格！</h2>
    <p className="text-sm text-text-secondary mt-1">おめでとうございます</p>
  </>
) : (
  <>
    <div className="text-4xl mb-2">😤</div>
    <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">不合格</h2>
    <p className="text-sm text-text-secondary mt-1">もう一度挑戦しましょう！</p>
  </>
)}
```

- [ ] **Step 3: Update score color for study mode**

Replace the CountUp className (lines 40-42) with:

```jsx
className={`text-5xl font-extrabold tracking-tight ${
  mode === 'study'
    ? 'text-primary'
    : passed
      ? 'text-green-700 dark:text-green-400'
      : 'text-red-700 dark:text-red-400'
}`}
```

- [ ] **Step 4: Update score bar color for study mode**

Replace the score bar gradient className (lines 51-55) with:

```jsx
className={`h-full rounded-full transition-all duration-1000 ${
  mode === 'study'
    ? 'bg-gradient-to-r from-primary to-blue-400'
    : passed
      ? 'bg-gradient-to-r from-green-500 to-green-400'
      : 'bg-gradient-to-r from-red-500 to-red-400'
}`}
```

- [ ] **Step 5: Update pass line label for study mode**

Replace the pass line label (line 61):
```jsx
<span>合格ライン {passScore}</span>
```

With:
```jsx
<span>{mode === 'study' ? `合格ラインは ${passScore}点` : `合格ライン ${passScore}`}</span>
```

- [ ] **Step 6: Conditionally hide time taken**

Replace lines 82-85:
```jsx
{/* Time taken */}
<p className="mt-4 text-sm text-text-secondary">
  所要時間: {minutes}分{seconds > 0 ? `${seconds}秒` : ''}
</p>
```

With:
```jsx
{/* Time taken */}
{!hideTimeTaken && (
  <p className="mt-4 text-sm text-text-secondary">
    所要時間: {minutes}分{seconds > 0 ? `${seconds}秒` : ''}
  </p>
)}
```

- [ ] **Step 7: Conditionally hide internal CTAs**

Replace lines 87-103:
```jsx
{/* Fail CTA */}
{!passed && testId && (
```

With:
```jsx
{/* Fail CTA */}
{!hideCtas && !passed && testId && (
```

- [ ] **Step 8: Suppress confetti in study mode**

Replace the confetti useEffect condition (line 12):
```jsx
if (passed) {
```

With:
```jsx
if (passed && mode !== 'study') {
```

- [ ] **Step 9: Verify build succeeds**

Run: `npx vite build 2>&1 | head -20`
Expected: Build succeeds. Existing Results page still works (all new props have defaults matching current behavior).

- [ ] **Step 10: Commit**

```bash
git add src/components/exam/ScoreCard.jsx
git commit -m "feat: add hideTimeTaken, hideCtas, mode props to ScoreCard for study reuse"
```

---

## Task 4: Create StudySummary page

**Files:**
- Create: `src/pages/StudySummary.jsx`

- [ ] **Step 1: Create the StudySummary component**

Create `src/pages/StudySummary.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'
import ScoreCard from '../components/exam/ScoreCard'
import Spinner from '../components/ui/Spinner'
import PageTransition from '../components/ui/PageTransition'

export default function StudySummary() {
  const { testId, sessionId } = useParams()
  const user = useAuthStore(s => s.user)
  const [session, setSession] = useState(null)
  const [test, setTest] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      // Fetch session
      const { data: sess, error: sErr } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sErr || !sess) {
        setError('データが見つかりません')
        setLoading(false)
        return
      }

      // Validate: must be a study session belonging to current user
      if (sess.mode !== 'study' || sess.user_id !== user?.id) {
        setError('データが見つかりません')
        setLoading(false)
        return
      }

      setSession(sess)

      // Fetch test meta
      const { data: t } = await supabase
        .from('tests')
        .select('*')
        .eq('id', sess.test_id)
        .single()
      setTest(t)

      // Fetch questions to compute stats
      const { data: qs } = await supabase
        .from('questions')
        .select('*, sub_questions(*)')
        .eq('test_id', sess.test_id)
        .order('question_number')

      // Fetch answers
      const { data: ans } = await supabase
        .from('answers')
        .select('*')
        .eq('session_id', sessionId)

      const answerMap = {}
      for (const a of ans || []) {
        const key = a.sub_question_id || a.question_id
        answerMap[key] = { user_answer: a.user_answer, is_correct: a.is_correct }
      }

      // Compute counts
      let correctCount = 0
      let wrongCount = 0
      let unansweredCount = 0

      for (const q of qs || []) {
        if (q.type === 'standard') {
          const a = answerMap[q.id]
          if (!a || a.user_answer === null || a.user_answer === undefined) unansweredCount++
          else if (a.is_correct) correctCount++
          else wrongCount++
        } else {
          for (const sq of q.sub_questions || []) {
            const a = answerMap[sq.id]
            if (!a || a.user_answer === null || a.user_answer === undefined) unansweredCount++
            else if (a.is_correct) correctCount++
            else wrongCount++
          }
        }
      }

      setStats({ correctCount, wrongCount, unansweredCount })
      setLoading(false)
    }
    load()
  }, [sessionId, user?.id])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (error || !session || !test) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-bg px-4 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-text-secondary">{error || 'データが見つかりません'}</p>
            <Link to="/" className="mt-4 inline-block text-primary hover:text-primary-hover text-sm font-medium">
              ホームに戻る
            </Link>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-bg px-4 py-6">
        <div className="mx-auto max-w-3xl">
          <ScoreCard
            score={session.score ?? 0}
            totalPoints={test.total_points ?? 50}
            passScore={test.pass_score ?? 45}
            passed={session.passed ?? false}
            timeTaken={0}
            correctCount={stats.correctCount}
            wrongCount={stats.wrongCount}
            unansweredCount={stats.unansweredCount}
            hideTimeTaken
            hideCtas
            mode="study"
          />

          {/* CTAs */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              to={`/exam/${testId}`}
              className="w-full max-w-xs rounded-xl bg-primary py-2.5 text-sm font-semibold text-white text-center shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover"
            >
              試験モードに挑戦
            </Link>
            <Link
              to={`/study/${testId}`}
              className="w-full max-w-xs rounded-xl bg-surface border border-theme-border py-2.5 text-sm font-medium text-text-secondary text-center transition-colors hover:bg-theme-border"
            >
              もう一度学習
            </Link>
            <Link
              to="/"
              className="text-primary text-sm font-medium hover:text-primary-hover mt-1"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Verify build succeeds**

Run: `npx vite build 2>&1 | head -20`
Expected: Build succeeds (page is not yet routed, but imports should resolve).

- [ ] **Step 3: Commit**

```bash
git add src/pages/StudySummary.jsx
git commit -m "feat: create StudySummary page for study mode completion"
```

---

## Task 5: Wire StudySummary route into App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add import**

After the `Study` import (line 13), add:

```jsx
import StudySummary from './pages/StudySummary'
```

- [ ] **Step 2: Add route**

After the `/study/:testId` route (lines 40-42), add:

```jsx
<Route path="/study/:testId/summary/:sessionId" element={
  <ProtectedRoute><StudySummary /></ProtectedRoute>
} />
```

- [ ] **Step 3: Verify build succeeds**

Run: `npx vite build 2>&1 | head -20`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add StudySummary route to App.jsx"
```

---

## Task 6: Add completion flow to Study.jsx

**Files:**
- Modify: `src/pages/Study.jsx`

- [ ] **Step 1: Add completion imports and store selectors**

Add the `completeExam` and `sessionId` selectors alongside the existing ones (around line 24). Note: `testId` is already available from `useParams()` at line 16 and `useNavigate` is already imported.

```jsx
const completeExam = useExamStore(s => s.completeExam)
const sessionId = useExamStore(s => s.sessionId)
```

Add a `completing` local state:

```jsx
const [completing, setCompleting] = useState(false)
```

- [ ] **Step 2: Add allAnswered check**

After the `handleAnswer` function, add a derived check:

```jsx
// Check if all questions have been answered
const allAnswered = questions.length > 0 && questions.every(q => {
  if (q.type === 'standard') {
    return answers[q.id] !== undefined
  }
  // Scenario: all sub_questions must be answered
  return q.sub_questions.every(sq => answers[sq.id] !== undefined)
})
```

- [ ] **Step 3: Add completion handler**

After `allAnswered`, add:

```jsx
const handleComplete = async () => {
  // Capture sessionId before unmount triggers reset(); testId is from useParams() so it's stable
  const capturedSessionId = sessionId
  setCompleting(true)
  await completeExam()
  navigate(`/study/${testId}/summary/${capturedSessionId}`)
}
```

- [ ] **Step 4: Update the last-question bottom nav**

Replace the existing last-question conditional block (lines 147-153):

```jsx
{currentIndex === questions.length - 1 ? (
  <button
    onClick={() => navigate('/')}
    className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover"
  >
    ホームに戻る
  </button>
) : (
```

With:

```jsx
{currentIndex === questions.length - 1 ? (
  <div className="flex items-center gap-2">
    {allAnswered ? (
      <button
        onClick={handleComplete}
        disabled={completing}
        className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        {completing ? '保存中...' : '学習を完了する'}
      </button>
    ) : (
      <>
        <button
          disabled
          className="rounded-xl bg-primary/50 px-6 py-2.5 text-sm font-semibold text-white/70 cursor-not-allowed"
        >
          学習を完了する
        </button>
        <button
          onClick={() => navigate('/')}
          className="text-text-secondary text-sm font-medium hover:text-text-primary"
        >
          ホームに戻る
        </button>
      </>
    )}
  </div>
) : (
```

- [ ] **Step 5: Verify build succeeds**

Run: `npx vite build 2>&1 | head -20`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Study.jsx
git commit -m "feat: add study completion with DB persistence and navigation to summary"
```

---

## Task 7: Add progress indicators to Home page

> **Dependency:** Tasks 3-6 (study completion) must be complete before this task. Without study completion persisted to DB, the study progress badges will always show `未受験`.

**Files:**
- Modify: `src/pages/Home.jsx`

- [ ] **Step 1: Add progress state and fetch**

Add `progress` state alongside existing state (around line 21):

```jsx
const [progress, setProgress] = useState({})
```

Add a new `useEffect` after the existing `fetchCategories` effect (after line 43), that fetches progress once on mount:

```jsx
// Fetch user progress across all tests (once on mount)
useEffect(() => {
  if (!user) return

  async function fetchProgress() {
    const { data, error } = await supabase
      .from('exam_sessions')
      .select('test_id, mode, score, passed')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)

    if (error || !data) return

    const map = {}
    for (const s of data) {
      if (!map[s.test_id]) {
        map[s.test_id] = { examBest: null, examAttempts: 0, examPassed: false, studyBest: null, studyAttempts: 0 }
      }
      const entry = map[s.test_id]
      if (s.mode === 'exam') {
        entry.examAttempts++
        if (s.passed) entry.examPassed = true
        if (entry.examBest === null || s.score > entry.examBest) entry.examBest = s.score
      } else if (s.mode === 'study') {
        entry.studyAttempts++
        if (entry.studyBest === null || s.score > entry.studyBest) entry.studyBest = s.score
      }
    }
    setProgress(map)
  }
  fetchProgress()
}, [user])
```

- [ ] **Step 2: Create ProgressBadge helper**

Add a helper function before the `Home` component export (or inside it, before the return):

```jsx
function ProgressBadge({ progress }) {
  if (!progress) {
    return (
      <span className="bg-surface text-text-secondary text-xs px-2 py-0.5 rounded-full shrink-0 ml-3">
        未受験
      </span>
    )
  }

  const { examBest, examAttempts, examPassed, studyBest, studyAttempts } = progress

  if (examPassed) {
    return (
      <span className="bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-3">
        合格 {examBest}点 ✓
      </span>
    )
  }

  if (examAttempts > 0) {
    return (
      <span className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-3">
        不合格 {examBest}点（{examAttempts}回）
      </span>
    )
  }

  if (studyAttempts > 0) {
    return (
      <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-3">
        学習 {studyBest}点（{studyAttempts}回）
      </span>
    )
  }

  return (
    <span className="bg-surface text-text-secondary text-xs px-2 py-0.5 rounded-full shrink-0 ml-3">
      未受験
    </span>
  )
}
```

- [ ] **Step 3: Replace hardcoded badge with ProgressBadge**

Replace the static badge in the test card (line 131-133):

```jsx
<span className="bg-surface text-text-secondary text-xs px-2 py-0.5 rounded-full shrink-0 ml-3">
  未受験
</span>
```

With:

```jsx
<ProgressBadge progress={progress[test.id]} />
```

- [ ] **Step 4: Verify build succeeds**

Run: `npx vite build 2>&1 | head -20`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Home.jsx
git commit -m "feat: add dynamic progress badges to home page test cards"
```

---

## Task 8: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add StudySummary to routing structure**

In the Routing Structure section, after the `/study/:testId` line, add:

```
/study/:testId/summary/:sessionId → Study summary (score + CTAs)
```

- [ ] **Step 2: Add StudySummary to project structure**

In the Project Structure section, under `src/pages/`, after `Study.jsx`, add:

```
│   │   ├── StudySummary.jsx    /study/:testId/summary/:sessionId — Study completion score + CTAs
```

- [ ] **Step 3: Update implementation status**

In the Implementation Status > Exam Mode section, add:

```
| `src/pages/StudySummary.jsx` | complete |
```

- [ ] **Step 4: Update authStore description**

In the Auth section of Implementation Status, update the `src/store/authStore.js` row description or add a note that it now includes `signUp` with email confirmation handling.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with StudySummary page and route"
```
