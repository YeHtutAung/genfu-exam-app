# Top 3 UX Improvements — Design Spec

Three highest-priority improvements from the UX review, ordered by user impact.

**Dependency note:** Feature 2's study progress badges only show data once Feature 3 is deployed (study sessions currently never complete). Implement Feature 3 before or alongside Feature 2.

---

## Feature 1: Registration on Login Page (Toggle Mode)

### Problem
The login page has a "新規登録" link pointing to `/register`, a route that doesn't exist. New users hit a dead end on their very first interaction.

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
- **Email confirmation handling:** `supabase.auth.signUp()` may return `data.session === null` when email confirmation is enabled in Supabase project settings.
  - If `data.session` is non-null: immediate session — call `fetchProfile(data.user.id)`, set user state, navigate to `/`.
  - If `data.session` is null: email confirmation required — return `{ confirmationNeeded: true }` to Login.jsx. Do NOT navigate or call `fetchProfile`.
- Login.jsx shows a confirmation message when `confirmationNeeded` is true: "確認メールを送信しました。メール内のリンクをクリックしてください。" The existing `onAuthStateChange` listener in `init()` handles the `SIGNED_IN` event when the user later confirms via email link.
- On error: set `error` in store (e.g., "このメールアドレスは既に登録されています").

**Cleanup:**
- Remove the dead `<a href="/register">` link.
- Replace with a `<button onClick>` that toggles mode state.

### Files changed
- `src/pages/Login.jsx` — add mode toggle, register form behavior, confirmation message state
- `src/store/authStore.js` — add `signUp` action with confirmation-aware return

---

## Feature 2: Home Page Progress Indicators

### Problem
Every test card shows a hardcoded `未受験` badge regardless of the user's history. Returning users can't tell which tests they've passed, failed, or never attempted. The data exists in `exam_sessions` but never flows back to the home page.

### Design

**Data fetching:** On mount (alongside existing category/tests fetch), query all completed sessions for the current user. Only run this query when `user` is non-null (guaranteed by `ProtectedRoute`, but guard defensively).

```
exam_sessions
  .select('test_id, mode, score, passed')
  .eq('user_id', currentUserId)
  .not('completed_at', 'is', null)
```

Fetch once on mount across all categories. The progress map is keyed by `test_id`, so cross-category sessions are simply unused when displaying a filtered category. This avoids re-fetching on every category switch.

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
- `src/pages/Home.jsx` — add progress fetch (guarded on user), build progress map, dynamic badge

---

## Feature 3: Study Mode Completion with DB Persistence

### Problem
Study mode never saves scores or answers to the DB. When the user finishes all 48 questions, they get an abrupt "ホームに戻る" button with no feedback on how they did. Study sessions are invisible — they don't appear in any history or influence the home page.

### Design

**Completion trigger:** On the last question, when all questions have been answered, the bottom nav shows "学習を完了する" (Complete Study) as the primary button instead of "ホームに戻る".

- "All answered" check reads from the Zustand in-memory store (`examStore.answers`), not the DB. Check: every standard question ID and every scenario sub_question ID exists as a key in `answers`.
- If the user reaches question 48 but hasn't answered everything: show disabled "学習を完了する" with a helper text note, plus "ホームに戻る" as a secondary text link.

**On tap "学習を完了する":**
1. Capture `sessionId` and `testId` from the store into local variables (needed before unmount triggers `reset()`).
2. `await completeExam()` — wait for DB writes (answers insert + session update) to finish before navigating. The existing function handles scoring, building answer rows, DB writes, and session completion. Works for study mode because `sessionId` and `mode: 'study'` are already set in the store.
3. Navigate to `/study/:testId/summary/:sessionId` using the captured local variables. Only after step 2 resolves.

**ScoreCard changes:** `ScoreCard` currently always renders time-taken and embeds its own CTA buttons for failed exams. For `StudySummary` reuse, add two props:
- `hideTimeTaken` (boolean, default false) — suppresses the "所要時間" row
- `hideCtas` (boolean, default false) — suppresses the internal CTA buttons
- `mode` (string: `'exam'` | `'study'`, default `'exam'`) — when `'study'`, changes pass/fail messaging:
  - Instead of "合格！" / "不合格": show "学習完了！" with a neutral tone (no crying/celebrating emoji)
  - Score bar still shows the pass threshold as a reference point, but the language is informational ("合格ラインは {passScore}点") rather than judgmental

**StudySummary page** — new lightweight results screen:

- Renders `ScoreCard` with `hideTimeTaken={true}`, `hideCtas={true}`, `mode="study"`.
- Reads `sessionId` and `testId` from `useParams()` (not from the exam store, which is reset on Study unmount).
- Fetches session data from DB: `exam_sessions.eq('id', sessionId).single()` then test meta from `tests`.
- **Validation:** Verify fetched session has `mode === 'study'` and belongs to current user. If not, show error state.
- **Error state:** If session not found or invalid, show "データが見つかりません" with a "ホームに戻る" link.
- No question-by-question review section (user already saw every answer with hints during study).
- Three CTAs (rendered by StudySummary, not ScoreCard):
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
- Track whether all questions are answered (derived from `answers` object vs `questions` array in the Zustand store).
- On last question: conditionally render "学習を完了する" (if all answered) or "ホームに戻る" (if not).
- On complete: capture `sessionId`/`testId` locally, call `completeExam()`, then navigate.

### Files changed
- `src/pages/Study.jsx` — completion button logic, navigate to summary
- `src/pages/StudySummary.jsx` — new page (lightweight results, fetches from DB)
- `src/components/exam/ScoreCard.jsx` — add `hideTimeTaken`, `hideCtas`, `mode` props
- `src/App.jsx` — add StudySummary route, import

---

## CLAUDE.md Updates

After implementation, update CLAUDE.md:
- Add `StudySummary.jsx` to project structure table
- Add `/study/:testId/summary/:sessionId` to routing structure
- Mark `StudySummary.jsx` as complete in implementation status
- Add `signUp` to authStore description

---

## Out of Scope

These items from the UX review are intentionally excluded from this spec:
- Submission confirmation for unanswered exam questions
- Category memory (localStorage)
- Admin dashboard restructuring
- Error recovery for exam submission
- Question randomization
- Score history page (separate from home page badges)
