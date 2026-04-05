# Shared UI + Admin Layer — Design Spec

**Date:** 2026-04-05
**Scope:** 4 pending files: `Button.jsx`, `Footer.jsx`, `adminStore.js`, `useAdmin.js`

---

## Overview

Completes the remaining pending files from the CLAUDE.md implementation status. Two are small shared UI components; two form the admin data layer that centralizes all admin page fetching and the upload pipeline state.

---

## 1. Button.jsx

**File:** `src/components/ui/Button.jsx`

Thin wrapper only — no variant system. Adds base Tailwind classes and passes everything else through.

```jsx
export default function Button({ className = '', children, ...props }) {
  return (
    <button
      className={`rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

**Rationale:** The codebase already uses Tailwind directly on all buttons. A variant system would add an API layer with no benefit at this scale. Callers keep writing `className="bg-primary text-white px-4 py-2 text-sm"` as they do today — Button just ensures consistent base styles and disabled handling.

**No changes to existing pages** — Button is additive. Existing inline buttons remain valid; new code can optionally use `<Button>`.

---

## 2. Footer.jsx

**File:** `src/components/layout/Footer.jsx`

Minimal one-liner: copyright on the left, `ThemeToggle` on the right.

```jsx
import ThemeToggle from '../ui/ThemeToggle'

export default function Footer() {
  return (
    <footer className="border-t border-theme-border bg-bg">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between text-sm text-text-secondary">
        <span>© 2026 Genfu Exam App</span>
        <ThemeToggle />
      </div>
    </footer>
  )
}
```

**Visibility rule:** Footer hides itself on routes where UI focus is critical. Uses `useLocation` (same pattern as Header):

```jsx
const location = useLocation()
const hidden = ['/login'].includes(location.pathname)
  || location.pathname.startsWith('/exam/')
  || (location.pathname.startsWith('/study/') && !location.pathname.includes('/summary/'))
if (hidden) return null
```

This hides the footer on `/login`, `/exam/:testId`, and `/study/:testId` (active session). It remains visible on `/study/:testId/summary/:sessionId`, `/results/:sessionId`, and all admin pages.

**Rationale:** This is a focused exam-prep utility app, not a marketing site. A multi-column footer adds visual weight without value. During active exam/study sessions, the footer adds noise below the question and timer. The theme toggle is surfaced here as a secondary access point (Header also has it) for long pages like Results and Users list.

**App.jsx:** Footer is rendered in `AppRoutes` below `<AnimatePresence>`, alongside the existing Header.

---

## 3. adminStore.js

**File:** `src/store/adminStore.js`

Flat Zustand store. Follows the same `(set, get) => ({ ...state, ...actions })` pattern as `authStore` and `examStore`. Per-section loading/error state so each admin page can show independent spinners.

### State shape

```js
{
  // Dashboard stats
  stats: null,            // { users: number, tests: number, sessions: number }
  statsLoading: false,
  statsError: null,

  // Tests management
  tests: [],              // [{ ...test, question_count: number, category: { code, name_jp } }]
  categories: [],         // [{ id, code, name_jp, name_en, active }]
  testsLoading: false,
  testsError: null,

  // Users management
  users: [],              // [{ ...profile, exam_count: number, best_score: number | null }]
  usersLoading: false,
  usersError: null,

  // Upload pipeline — flows from Upload page to UploadPreview page
  uploadPreview: null,    // parsed bundle payload from /api/upload-bundle response
}
```

### Actions

| Action | Description |
|---|---|
| `fetchStats()` | COUNT queries on `profiles`, `tests`, `exam_sessions` |
| `fetchTests()` | SELECT tests + categories + `questions(id)` for count; computes `question_count` locally |
| `fetchUsers()` | SELECT profiles; SELECT `user_id, score` from `exam_sessions` where `mode='exam'`; aggregates `exam_count` + `best_score` per user |
| `toggleTestActive(testId, active)` | UPDATE `tests.active`; calls `fetchTests()` to refresh |
| `deleteTest(testId)` | DELETE from `tests`; calls `fetchTests()` to refresh |
| `setUploadPreview(payload)` | Sets `uploadPreview` — called from Upload page after `/api/upload-bundle` succeeds |
| `clearUploadPreview()` | Clears `uploadPreview` — called after confirm or cancel in UploadPreview |

### Refactored pages

Each admin page drops its inline `useState`/`useEffect` fetch and reads from the store:

| Page | Before | After |
|---|---|---|
| `AdminDashboard.jsx` | Inline `supabase` queries for counts | `useAdmin('stats')` |
| `Tests.jsx` | Inline queries for tests + categories | `useAdmin('tests')` + store actions for toggle/delete |
| `Users.jsx` | Inline queries for profiles + sessions | `useAdmin('users')` |
| `Upload.jsx` | `navigate('/admin/upload/preview', { state: payload })` | `setUploadPreview(payload)` then `navigate(...)` |
| `UploadPreview.jsx` | `location.state` for bundle data | `adminStore.uploadPreview` |

---

## 4. useAdmin.js

**File:** `src/hooks/useAdmin.js`

Single hook that takes a section key, auto-fetches on mount, and returns `{ data, loading, error, refetch }`.

```js
const sectionMap = {
  stats: {
    data:    s => s.stats,
    loading: s => s.statsLoading,
    error:   s => s.statsError,
    fetch:   'fetchStats',
  },
  tests: {
    data:    s => s.tests,
    loading: s => s.testsLoading,
    error:   s => s.testsError,
    fetch:   'fetchTests',
  },
  users: {
    data:    s => s.users,
    loading: s => s.usersLoading,
    error:   s => s.usersError,
    fetch:   'fetchUsers',
  },
}

export default function useAdmin(section) {
  const map = sectionMap[section]
  const data    = useAdminStore(map.data)
  const loading = useAdminStore(map.loading)
  const error   = useAdminStore(map.error)
  const action  = useAdminStore(s => s[map.fetch])

  useEffect(() => { action() }, [])

  return { data, loading, error, refetch: action }
}
```

**Usage in pages:**
```js
// AdminDashboard.jsx
const { data: stats, loading, error } = useAdmin('stats')

// Tests.jsx
const { data: tests, loading, error, refetch } = useAdmin('tests')
const toggleTestActive = useAdminStore(s => s.toggleTestActive)
const deleteTest = useAdminStore(s => s.deleteTest)
```

---

## Implementation Order

1. `Button.jsx` — no dependencies
2. `Footer.jsx` — depends on `ThemeToggle` (already exists)
3. `adminStore.js` — depends on `supabase` client (already exists)
4. `useAdmin.js` — depends on `adminStore`
5. Refactor admin pages to use `useAdmin` + store actions
6. Update CLAUDE.md

---

## Implementation Notes

- Before refactoring `Upload.jsx` and `UploadPreview.jsx`, read both files to confirm how bundle data is currently passed between them (may be `location.state`, a prop, or already partial store usage).
- Admin pages must render an error state when `xxxError` is non-null. Pattern: inline banner below the page heading — `<p className="text-wrong text-sm">{error}</p>` — so the admin knows the fetch failed rather than seeing an empty table silently.
- `useAdmin` initial render: `data` is `null` and `loading` is `false` for one cycle before `useEffect` fires. Admin pages should treat `!data && !loading` as the loading state (show `<Spinner>`) to avoid a blank flash.

---

## Out of Scope

- No new routes added
- No new API Edge Functions
- `Button` is not retroactively applied to existing buttons (additive only)
- `Footer` ThemeToggle is secondary — Header ThemeToggle remains primary
