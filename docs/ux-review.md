# UX Review

This app already has a strong core exam flow: one question at a time, visible progress, a timer, persisted session state, study feedback, and result review. The main product gap is not the exam-taking experience itself, but the surrounding learning loop.

## What Works

- Exam mode is focused and low-distraction.
- Study mode gives immediate feedback, hints, and optional AI explanation.
- Results show score, pass/fail state, and review paths.
- Home now shows per-test progress badges and remembers the selected category.
- Study mode has a completion summary route.
- Dark mode is broadly supported through theme tokens.

## Highest-Value Improvements

1. Add a score history page so returning users can see improvement over time.
2. Add more actionable admin dashboard data, such as disabled tests or recent uploads.
3. Add server-side exam completion eventually, so scoring and answer persistence are atomic.
4. Add integration tests for the protected admin upload APIs.
5. Consider question-order randomization for repeat practice sessions.

## Current Risk Areas

- Admin upload APIs now enforce server-side admin authorization, but should be smoke-tested against a deployed preview using `npm run smoke:admin-auth`.
- Exam submission now has retry/error UI, but long-term atomicity would be better handled by a server-side endpoint.
- The project depends on Japanese copy and content, so terminal/editor UTF-8 behavior should be checked before reviewing text changes.
