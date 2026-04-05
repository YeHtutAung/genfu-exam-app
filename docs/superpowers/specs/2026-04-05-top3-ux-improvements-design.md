# Top 3 UX Improvements — Design Spec

Three highest-priority improvements from the UX review, ordered by user impact.

---

## Feature 1: Registration on Login Page (Toggle Mode)

### Problem
The login page has a "新規登録はこちら" link pointing to `/register`, a route that doesn't exist. New users hit a dead end on their very first interaction.

### Design

**Login.jsx** gains a `mode` state: `'login'` | `'register'`.

**Toggle UI:** Two buttons at the top of the form card — "ログイン" and "新規登録" — styled as a segmented control. The active mode gets primary color fill; the inactive mode gets surface/border styling.

**Form behavior by mode:**

| | Login mode | Register mode |
|---|---|---|
| Fields | email + password | email + password |
| Submit action | `signInWithPassword(email, password)` | `signUp(email, password)` (new) |
| Button label | ログイン | アカウント作成 |
| Bottom link text | アカウントをお持ちでない方は **新規登録** | すでにアカウントをお持ちの方は **ログイン** |
| Bottom link action | Switch to register mode | Switch to login mode |

**authStore changes:**
- New `signUp` action: calls `supabase.auth.signUp({ email, password })`.
- On success: the existing DB trigger `handle_new_user()` auto-creates the profile row with `role: 'user'`. Then `fetchProfile()` runs and we set user state.
- On error: set `error` in store (e.g., "このメールアドレスは既に登録されています").
- On success in Login.jsx: navigate to `/`.

**Cleanup:**
- Remove the dead `<a href="/register">` link.
- Replace with an `<button onClick>` that toggles mode state.

### Files changed
- `src/pages/Login.jsx` — add mode toggle, register form behavior
- `src/store/authStore.js` — add `signUp` action

---

## Feature 2: Home Page Progress Indicators

### Problem
Every test card shows a hardcoded `未受験` badge regardless of the user's history. Returning users can't tell which tests they've passed, failed, or never attempted. The data exists in `exam_sessions` but never flows back to the home page.

### Design

**Data fetching:** On mount (alongside existing category/tests fetch), query:
```
exam_sessions
  .select('test_id, mode, score, passed')
  .eq('user_id', currentUserId)
  .not('completed_at', 'is', null)
```

**Processing:** Build a progress map keyed by `test_id`:
```js
{
  [testId]: {
    examBest: number | null,    // highest exam score
    examAttempts: number,       // count of completed exam sessions
    examPassed: boolean,        // true if any exam session passed
    studyBest: number | null,   // highest study score
    studyAttempts: number,      // count of completed study sessions
  }
}
```

**Badge rendering** (priority order, first match wins):

| Condition | Badge text | Style |
|---|---|---|
| `examPassed === true` | `合格 {examBest}点 ✓` | green bg, white text |
| `examAttempts > 0` (but never passed) | `不合格 {examBest}点（{examAttempts}回）` | red/10 bg, red text |
| `studyAttempts > 0` (no exam taken) | `学習 {studyBest}点（{studyAttempts}回）` | purple/10 bg, purple text |
| No sessions at all | `未受験` | gray bg (surface), gray text |

**Badge placement:** Same top-right position as current hardcoded `未受験` span. Replace the static span with dynamic content.

### Files changed
- `src/pages/Home.jsx` — add progress fetch, build progress map, dynamic badge

---

## Feature 3: Study Mode Completion with DB Persistence

### Problem
Study mode never saves scores or answers to the DB. When the user finishes all 48 questions, they get an abrupt "ホームに戻る" button with no feedback on how they did. Study sessions are invisible — they don't appear in any history or influence the home page.

### Design

**Completion trigger:** On the last question, when all questions have been answered, the bottom nav shows "学習を完了する" (Complete Study) as the primary button instead of "ホームに戻る".

- "All answered" means: every standard question has an entry in `answers`, and every sub_question of every scenario question has an entry.
- If the user reaches question 48 but hasn't answered everything: show disabled "学習を完了する" with a helper text note, plus "ホームに戻る" as a secondary text link.

**On tap "学習を完了する":**
1. Call `completeExam()` — the existing function already handles scoring, building answer rows, DB writes, and session completion. Works for study mode because `sessionId` and `mode: 'study'` are already set in the store.
2. Navigate to `/study/:testId/summary/:sessionId`.

**StudySummary page** — new lightweight results screen:

- Reuses existing `ScoreCard` component (score animation, correct/wrong/unanswered counts, pass/fail visual).
- No question-by-question review section (user already saw every answer with hints during study).
- No time-taken display (study mode is untimed).
- Three CTAs:
  - "試験モードに挑戦" → `/exam/:testId` — primary button, blue gradient
  - "もう一度学習" → `/study/:testId` — secondary button, surface bg
  - "ホームに戻る" → `/` — text link below buttons

**Route:** Add to App.jsx:
```jsx
<Route path="/study/:testId/summary/:sessionId" element={
  <ProtectedRoute><StudySummary /></ProtectedRoute>
} />
```

**Study.jsx changes:**
- Track whether all questions are answered (derived from `answers` object vs `questions` array).
- On last question: conditionally render "学習を完了する" (if all answered) or "ホームに戻る" (if not).
- On complete: call `completeExam()`, then `navigate(`/study/${testId}/summary/${sessionId}`)`.

### Files changed
- `src/pages/Study.jsx` — completion button logic, navigate to summary
- `src/pages/StudySummary.jsx` — new page (lightweight results)
- `src/App.jsx` — add StudySummary route
- `src/store/examStore.js` — no changes needed, `completeExam()` already works for both modes

---

## Out of Scope

These items from the UX review are intentionally excluded from this spec:
- Submission confirmation for unanswered exam questions
- Category memory (localStorage)
- Admin dashboard restructuring
- Error recovery for exam submission
- Question randomization
- Score history page (separate from home page badges)
