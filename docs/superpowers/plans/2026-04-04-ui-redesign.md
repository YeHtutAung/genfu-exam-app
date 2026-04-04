# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Genfu Exam App from a functional MVP into a polished, modern web app with custom design system, dark mode, and rich animations.

**Architecture:** Custom Tailwind theme with CSS custom properties for dark/light mode. Framer Motion for animations. Inter + Noto Sans JP via Google Fonts. All changes are visual — no data flow, API, or logic changes.

**Tech Stack:** React 18, Tailwind CSS 3, Framer Motion, canvas-confetti, Google Fonts (Inter, Noto Sans JP)

**Spec:** `docs/superpowers/specs/2026-04-04-ui-redesign-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|---|---|
| `src/components/ui/PageTransition.jsx` | Framer Motion wrapper for page-level fade+slide |
| `src/components/ui/AnimatedCard.jsx` | Card with entrance animation (fade+slide) |
| `src/components/ui/StaggerList.jsx` | Staggered children entrance animation |
| `src/components/ui/CountUp.jsx` | Animated number counter (0 → target) |
| `src/components/ui/Skeleton.jsx` | Shimmer skeleton loader |
| `src/components/ui/ThemeToggle.jsx` | Sun/moon dark mode toggle button |
| `src/hooks/useReducedMotion.js` | Checks prefers-reduced-motion media query |
| `src/hooks/useTheme.js` | Dark mode state, localStorage, system preference |

### Modified Files
| File | What Changes |
|---|---|
| `package.json` | Add framer-motion, canvas-confetti |
| `index.html` | Add Google Fonts links |
| `tailwind.config.js` | Custom colors, fonts, darkMode: 'class' |
| `src/index.css` | CSS custom properties for light/dark themes |
| `src/App.jsx` | AnimatePresence wrapper for route transitions |
| `src/components/layout/Header.jsx` | Branded logo, theme toggle, user avatar, dark mode classes |
| `src/components/ui/Spinner.jsx` | Use theme colors |
| `src/components/ui/Modal.jsx` | Rounded-xl, dark mode, theme colors |
| `src/pages/Login.jsx` | Gradient bg, frosted card, styled inputs/buttons |
| `src/pages/Home.jsx` | Category icons, test card redesign, stagger animation |
| `src/pages/Exam.jsx` | Timer pill, progress bar, question slide animation |
| `src/pages/Study.jsx` | Hint card, AI card, reveal animations |
| `src/pages/Results.jsx` | Count-up, confetti, stat grid |
| `src/components/exam/QuestionCard.jsx` | Answer button redesign, tap animation |
| `src/components/exam/Timer.jsx` | Pill design, pulse animation |
| `src/components/exam/ProgressBar.jsx` | Gradient bar, thicker |
| `src/components/exam/ScoreCard.jsx` | Count-up, stat grid, confetti |
| `src/components/study/StudyCard.jsx` | Feedback labels, hint card |
| `src/components/study/AIExplanation.jsx` | Purple gradient card |

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install framer-motion and canvas-confetti**

```bash
npm install framer-motion canvas-confetti
```

- [ ] **Step 2: Verify install**

```bash
node -e "require('framer-motion'); require('canvas-confetti'); console.log('OK')"
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add framer-motion and canvas-confetti dependencies"
```

---

## Task 2: Design System Foundation — Tailwind Config + CSS Variables + Fonts

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`
- Modify: `index.html`

- [ ] **Step 1: Update `index.html` — add Google Fonts**

Add to `<head>` before `<title>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
```

- [ ] **Step 2: Replace `tailwind.config.js` with custom theme**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        correct: 'var(--color-correct)',
        wrong: 'var(--color-wrong)',
        ai: 'var(--color-ai)',
        warning: 'var(--color-warning)',
        'theme-border': 'var(--color-border)',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif'],
        jp: ['"Noto Sans JP"', 'sans-serif'],
        mono: ['ui-monospace', 'SF Mono', 'monospace'],
      },
      letterSpacing: {
        tight: '-0.02em',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Replace `src/index.css` with CSS custom properties + Tailwind directives**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-bg: #ffffff;
    --color-surface: #f8fafc;
    --color-primary: #3b82f6;
    --color-primary-hover: #2563eb;
    --color-text-primary: #0f172a;
    --color-text-secondary: #64748b;
    --color-correct: #22c55e;
    --color-wrong: #ef4444;
    --color-ai: #8b5cf6;
    --color-warning: #f59e0b;
    --color-border: #e2e8f0;
  }

  .dark {
    --color-bg: #0f172a;
    --color-surface: #1e293b;
    --color-primary: #60a5fa;
    --color-primary-hover: #93bbfd;
    --color-text-primary: #f1f5f9;
    --color-text-secondary: #94a3b8;
    --color-correct: #4ade80;
    --color-wrong: #f87171;
    --color-ai: #a78bfa;
    --color-warning: #fbbf24;
    --color-border: #334155;
  }

  body {
    @apply bg-bg text-text-primary font-sans antialiased;
    transition: background-color 200ms ease-out, color 200ms ease-out;
  }
}
```

- [ ] **Step 4: Run dev server and verify fonts load, no build errors**

```bash
npm run dev
```

Open browser, inspect body — verify `font-family: Inter, "Noto Sans JP", ...` is applied and background is white.

- [ ] **Step 5: Commit**

```bash
git add index.html tailwind.config.js src/index.css
git commit -m "feat: add design system foundation — custom Tailwind theme, CSS variables, Google Fonts"
```

---

## Task 3: Theme Hook + Toggle Component

**Files:**
- Create: `src/hooks/useTheme.js`
- Create: `src/components/ui/ThemeToggle.jsx`

- [ ] **Step 1: Create `src/hooks/useTheme.js`**

```js
import { useEffect, useState } from 'react'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggle = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))

  return { theme, toggle }
}
```

- [ ] **Step 2: Create `src/components/ui/ThemeToggle.jsx`**

```jsx
export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-text-secondary transition-colors hover:bg-theme-border"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.06 1.06l1.06 1.06z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTheme.js src/components/ui/ThemeToggle.jsx
git commit -m "feat: add dark mode hook and toggle component"
```

---

## Task 4: Animation Utilities — useReducedMotion, PageTransition, AnimatedCard, StaggerList, CountUp, Skeleton

**Files:**
- Create: `src/hooks/useReducedMotion.js`
- Create: `src/components/ui/PageTransition.jsx`
- Create: `src/components/ui/AnimatedCard.jsx`
- Create: `src/components/ui/StaggerList.jsx`
- Create: `src/components/ui/CountUp.jsx`
- Create: `src/components/ui/Skeleton.jsx`

- [ ] **Step 1: Create `src/hooks/useReducedMotion.js`**

```js
import { useEffect, useState } from 'react'

export default function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}
```

- [ ] **Step 2: Create `src/components/ui/PageTransition.jsx`**

```jsx
import { motion } from 'framer-motion'
import useReducedMotion from '../../hooks/useReducedMotion'

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const instantVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
}

export default function PageTransition({ children }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      variants={reduced ? instantVariants : variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 3: Create `src/components/ui/AnimatedCard.jsx`**

```jsx
import { motion } from 'framer-motion'
import useReducedMotion from '../../hooks/useReducedMotion'

export default function AnimatedCard({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduced ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: 'easeOut' }}
      whileHover={reduced ? {} : { scale: 1.01, transition: { duration: 0.15 } }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 4: Create `src/components/ui/StaggerList.jsx`**

```jsx
import { motion } from 'framer-motion'
import useReducedMotion from '../../hooks/useReducedMotion'

const container = {
  animate: {
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.15, ease: 'easeOut' } },
}

const instantItem = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
}

export default function StaggerList({ children, className = '' }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={container}
      initial="initial"
      animate="animate"
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={reduced ? instantItem : item}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  )
}
```

- [ ] **Step 5: Create `src/components/ui/CountUp.jsx`**

```jsx
import { useEffect, useState } from 'react'
import useReducedMotion from '../../hooks/useReducedMotion'

export default function CountUp({ target, duration = 1500, className = '' }) {
  const reduced = useReducedMotion()
  const [value, setValue] = useState(reduced ? target : 0)

  useEffect(() => {
    if (reduced) {
      setValue(target)
      return
    }

    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, reduced])

  return <span className={className}>{value}</span>
}
```

- [ ] **Step 6: Create `src/components/ui/Skeleton.jsx`**

```jsx
export default function Skeleton({ className = 'h-4 w-full' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-theme-border ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useReducedMotion.js src/components/ui/PageTransition.jsx src/components/ui/AnimatedCard.jsx src/components/ui/StaggerList.jsx src/components/ui/CountUp.jsx src/components/ui/Skeleton.jsx
git commit -m "feat: add animation utilities — PageTransition, AnimatedCard, StaggerList, CountUp, Skeleton"
```

---

## Task 5: Update App.jsx — AnimatePresence for Route Transitions

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Update `src/App.jsx`**

Add imports at top:
```jsx
import { AnimatePresence } from 'framer-motion'
import useTheme from './hooks/useTheme'
```

Add `useTheme()` call inside App component (above the loading check):
```jsx
const { theme, toggle: toggleTheme } = useTheme()
```

Pass theme props to Header:
```jsx
<Header theme={theme} toggleTheme={toggleTheme} />
```

Wrap `<Routes>` with `<AnimatePresence mode="wait">`:
```jsx
<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
```

Add `useLocation` import from react-router-dom and get location inside the BrowserRouter. The full structure becomes:

```jsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import useAuthStore from './store/authStore'
import useTheme from './hooks/useTheme'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Header from './components/layout/Header'
import Spinner from './components/ui/Spinner'

import Home            from './pages/Home'
import Login           from './pages/Login'
import Exam            from './pages/Exam'
import Study           from './pages/Study'
import Results         from './pages/Results'
import AdminDashboard  from './pages/admin/AdminDashboard'
import Upload          from './pages/admin/Upload'
import UploadPreview   from './pages/admin/UploadPreview'
import Tests           from './pages/admin/Tests'
import Users           from './pages/admin/Users'

function AppRoutes({ theme, toggleTheme }) {
  const location = useLocation()

  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Authenticated */}
          <Route path="/" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          } />
          <Route path="/exam/:testId" element={
            <ProtectedRoute><Exam /></ProtectedRoute>
          } />
          <Route path="/study/:testId" element={
            <ProtectedRoute><Study /></ProtectedRoute>
          } />
          <Route path="/results/:sessionId" element={
            <ProtectedRoute><Results /></ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/upload" element={
            <ProtectedRoute adminOnly><Upload /></ProtectedRoute>
          } />
          <Route path="/admin/upload/preview" element={
            <ProtectedRoute adminOnly><UploadPreview /></ProtectedRoute>
          } />
          <Route path="/admin/tests" element={
            <ProtectedRoute adminOnly><Tests /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly><Users /></ProtectedRoute>
          } />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default function App() {
  const loading = useAuthStore(s => s.loading)
  const { theme, toggle: toggleTheme } = useTheme()

  useEffect(() => {
    useAuthStore.getState().init()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <Spinner />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AppRoutes theme={theme} toggleTheme={toggleTheme} />
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Verify app loads, no errors in console**

```bash
npm run dev
```

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add AnimatePresence route transitions and theme support to App"
```

---

## Task 6: Redesign Header

**Files:**
- Modify: `src/components/layout/Header.jsx`

- [ ] **Step 1: Replace `src/components/layout/Header.jsx`**

```jsx
import { Link, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import ThemeToggle from '../ui/ThemeToggle'

export default function Header({ theme, toggleTheme }) {
  const user = useAuthStore(s => s.user)
  const role = useAuthStore(s => s.role)
  const signOut = useAuthStore(s => s.signOut)
  const location = useLocation()

  if (location.pathname === '/login') return null

  const isActive = (path) => location.pathname === path

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??'

  return (
    <header className="sticky top-0 z-50 bg-bg border-b border-theme-border shadow-sm transition-colors">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover text-white text-sm font-bold">
            G
          </div>
          <span className="text-lg font-bold text-text-primary tracking-tight">
            Genfu
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          {user ? (
            <>
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                ホーム
              </Link>
              {role === 'admin' && (
                <Link
                  to="/admin"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  管理
                </Link>
              )}
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-white text-xs font-semibold">
                {initials}
              </div>
              <button
                onClick={signOut}
                className="rounded-lg bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-theme-border"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <Link
                to="/login"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
              >
                ログイン
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify header renders correctly, theme toggle works**

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Header.jsx
git commit -m "feat: redesign header with branded logo, theme toggle, user avatar"
```

---

## Task 7: Update Spinner and Modal for Theme

**Files:**
- Modify: `src/components/ui/Spinner.jsx`
- Modify: `src/components/ui/Modal.jsx`

- [ ] **Step 1: Update `src/components/ui/Spinner.jsx`**

```jsx
export default function Spinner({ size = 'h-8 w-8' }) {
  return (
    <div
      className={`${size} animate-spin rounded-full border-4 border-theme-border border-t-primary`}
      role="status"
    >
      <span className="sr-only">読み込み中…</span>
    </div>
  )
}
```

- [ ] **Step 2: Update `src/components/ui/Modal.jsx`**

```jsx
import { useEffect, useRef } from 'react'

export default function Modal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = '確認', cancelLabel = 'キャンセル', danger = false }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-full max-w-sm rounded-2xl bg-bg p-6 shadow-xl backdrop:bg-black/50 border border-theme-border"
      onClose={onCancel}
    >
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      <p className="mt-2 text-sm text-text-secondary">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-xl bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-theme-border"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors ${
            danger
              ? 'bg-wrong hover:bg-red-700'
              : 'bg-primary hover:bg-primary-hover'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Spinner.jsx src/components/ui/Modal.jsx
git commit -m "feat: update Spinner and Modal with theme colors and rounded-2xl"
```

---

## Task 8: Redesign Login Page

**Files:**
- Modify: `src/pages/Login.jsx`

- [ ] **Step 1: Read current `src/pages/Login.jsx` to understand its full structure and state logic**

```bash
cat src/pages/Login.jsx
```

- [ ] **Step 2: Update Login.jsx**

Keep all existing state logic and handlers intact. Replace the JSX return with the redesigned version:

- Outer wrapper: `min-h-screen bg-gradient-to-br from-blue-50 via-bg to-purple-50 dark:from-slate-900 dark:via-bg dark:to-slate-800 flex items-center justify-center px-4`
- Branded logo mark centered above form
- Welcome text: `おかえりなさい` heading + subtitle
- Form card: `bg-bg rounded-2xl p-6 shadow-lg border border-theme-border`
- Inputs: `w-full rounded-xl border-[1.5px] border-theme-border bg-bg px-3.5 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:border-primary focus:ring-3 focus:ring-primary/10 outline-none transition-colors`
- Primary button: `w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary-hover`
- Divider: flex row with lines and "または" centered
- Social buttons: `w-full rounded-xl border-[1.5px] border-theme-border bg-bg py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface`
- Wrap page in `PageTransition` component

- [ ] **Step 3: Verify login page renders with gradient background and new styling**

- [ ] **Step 4: Commit**

```bash
git add src/pages/Login.jsx
git commit -m "feat: redesign login page with gradient bg, frosted card, branded logo"
```

---

## Task 9: Redesign Home Page

**Files:**
- Modify: `src/pages/Home.jsx`

- [ ] **Step 1: Read current `src/pages/Home.jsx`**

```bash
cat src/pages/Home.jsx
```

- [ ] **Step 2: Update Home.jsx**

Keep all existing data fetching and state logic. Update the JSX:

- Wrap in `PageTransition`
- Section label: `text-xs font-semibold uppercase tracking-wide text-primary` — "Practice Tests"
- Main heading: `text-3xl font-bold text-text-primary tracking-tight`
- Subtitle: `text-sm text-text-secondary mt-1`
- Category buttons: grid of `rounded-xl` buttons
  - Selected: `bg-gradient-to-br from-primary to-primary-hover text-white shadow-md shadow-primary/25 font-semibold`
  - Unselected: `bg-bg border-[1.5px] border-theme-border text-text-secondary font-medium hover:bg-surface`
  - Add emoji icons: 🛵 原付, 🏍️ 普通二輪, 🏍️ 大型二輪, 🚗 普通自動車
- Test cards: wrap list in `StaggerList`
  - Card: `bg-bg border border-theme-border rounded-xl p-4 shadow-sm`
  - Title: `text-base font-semibold text-text-primary`
  - Subtitle: `text-xs text-text-secondary` — "48問 · 30分 · 合格: 45点"
  - Score badge (if previous score exists): `bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full`
  - Two buttons per card: "試験モード" (primary) + "学習モード" (ghost/surface)

- [ ] **Step 3: Verify home page renders with new card layout and animations**

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.jsx
git commit -m "feat: redesign home page with category icons, score badges, stagger animation"
```

---

## Task 10: Redesign Exam Components — Timer, ProgressBar, QuestionCard

**Files:**
- Modify: `src/components/exam/Timer.jsx`
- Modify: `src/components/exam/ProgressBar.jsx`
- Modify: `src/components/exam/QuestionCard.jsx`

- [ ] **Step 1: Read all three files**

```bash
cat src/components/exam/Timer.jsx src/components/exam/ProgressBar.jsx src/components/exam/QuestionCard.jsx
```

- [ ] **Step 2: Update `src/components/exam/Timer.jsx`**

Keep all timer logic. Add `import { motion } from 'framer-motion'` and `import useReducedMotion from '../../hooks/useReducedMotion'` at top. Update the JSX:

- Timer wrapper: wrap in `motion.div` for pulse animation
- Outer classes: `flex items-center gap-2 rounded-xl border-[1.5px] bg-bg px-3.5 py-1.5 shadow-sm transition-colors`
- Clock icon: `⏱` span
- Time display: `font-mono text-lg font-bold tabular-nums text-text-primary`
- Color states — apply these classes to the wrapper based on remaining time:
  - Normal: `border-theme-border`
  - Warning (<5min): `border-warning text-warning` + on motion.div: `animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 1, repeat: Infinity }}`
  - Critical (<1min): `border-wrong text-wrong` + on motion.div: `animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.5, repeat: Infinity }}`
  - If `useReducedMotion()` returns true, skip the scale animation (just use static styles)

- [ ] **Step 3: Update `src/components/exam/ProgressBar.jsx`**

Keep logic. Update JSX:

- Track: `h-1.5 rounded-full bg-theme-border overflow-hidden`
- Fill: `h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-300`

- [ ] **Step 4: Update `src/components/exam/QuestionCard.jsx`**

Keep all answer logic. Update JSX:

- Card: `bg-bg border border-theme-border rounded-xl p-5 shadow-sm`
- Type label: `text-xs font-semibold uppercase tracking-wide text-primary mb-2` — e.g., "標準問題 · 1点"
- Question text: `text-lg font-medium leading-relaxed text-text-primary font-jp`
- Answer buttons: `flex-1 rounded-xl border-[1.5px] py-3 text-base font-medium transition-all`
  - Unselected: `border-theme-border bg-bg text-text-secondary hover:bg-surface`
  - Selected: `border-primary bg-primary/5 text-primary ring-3 ring-primary/10 font-semibold`
  - Correct (review): `border-correct bg-correct/5 text-correct font-semibold`
  - Wrong (review): `border-wrong bg-wrong/5 text-wrong font-semibold`
- Wrap answer buttons in `motion.button` with `whileTap={{ scale: 0.97 }}`

- [ ] **Step 5: Verify exam page renders correctly**

- [ ] **Step 6: Commit**

```bash
git add src/components/exam/Timer.jsx src/components/exam/ProgressBar.jsx src/components/exam/QuestionCard.jsx
git commit -m "feat: redesign exam components — timer pill, gradient progress, answer ring glow"
```

---

## Task 11: Redesign Exam Page — Question Slide Animation

**Files:**
- Modify: `src/pages/Exam.jsx`

- [ ] **Step 1: Read current `src/pages/Exam.jsx`**

```bash
cat src/pages/Exam.jsx
```

- [ ] **Step 2: Update Exam.jsx**

Keep all state logic, question navigation, and submission logic. Update JSX:

- Wrap page in `PageTransition`
- Question number: `text-text-secondary text-xs` label + `text-xl font-bold text-text-primary` number + `text-text-secondary text-sm` total
- Track navigation direction in state: `const [direction, setDirection] = useState(0)` (1 = forward, -1 = back)
- On "next" click: `setDirection(1)` then advance. On "prev" click: `setDirection(-1)` then go back.
- Wrap QuestionCard in `AnimatePresence mode="wait" custom={direction}`:

```jsx
import { motion, AnimatePresence } from 'framer-motion'

const slideVariants = {
  initial: (dir) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
}

// In JSX:
<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentQuestionIndex}
    custom={direction}
    variants={slideVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <QuestionCard ... />
  </motion.div>
</AnimatePresence>
```

- Navigation buttons: "← 前へ" as ghost button, "次へ →" as primary button
- Submit button: `bg-primary text-white rounded-xl px-6 py-2.5 font-semibold shadow-sm`
- Question grid (desktop): update button colors to use theme tokens

- [ ] **Step 3: Verify question transitions animate on navigation**

- [ ] **Step 4: Commit**

```bash
git add src/pages/Exam.jsx
git commit -m "feat: redesign exam page with question slide animation and themed navigation"
```

---

## Task 12: Redesign Study Components — StudyCard, AIExplanation

**Files:**
- Modify: `src/components/study/StudyCard.jsx`
- Modify: `src/components/study/AIExplanation.jsx`

- [ ] **Step 1: Read both files**

```bash
cat src/components/study/StudyCard.jsx src/components/study/AIExplanation.jsx
```

- [ ] **Step 2: Update `src/components/study/StudyCard.jsx`**

Keep all logic. Update JSX:

- Same answer button styles as QuestionCard (theme tokens, ring glow)
- After answer reveal:
  - User's wrong answer labeled: `← あなたの回答`
  - Correct answer marked: `✓`
  - Wrong answer: wrap in `motion.div` with shake animation `animate={{ x: [-8, 8, -8, 8, 0] }}` (if reduced motion, skip)
  - Correct answer: wrap in `motion.div` with pulse `animate={{ scale: [1, 1.05, 1] }}`
- Hint card: `bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3` with 💡 icon
- Wrap hint and AI explanation sections in `motion.div` with `initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}` for reveal animation

- [ ] **Step 3: Update `src/components/study/AIExplanation.jsx`**

Keep all fetch/stream logic. Update JSX:

- Container: `bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4 shadow-sm`
- Header: gradient icon `bg-gradient-to-br from-ai to-purple-600 rounded-lg w-6 h-6` with ✨ + "AI解説" label in `text-purple-800 dark:text-purple-300 font-semibold`
- Text: `text-purple-900 dark:text-purple-200 text-sm leading-relaxed`
- Loading state: use `Skeleton` component instead of Spinner

- [ ] **Step 4: Commit**

```bash
git add src/components/study/StudyCard.jsx src/components/study/AIExplanation.jsx
git commit -m "feat: redesign study mode — hint card, AI card, answer animations"
```

---

## Task 13: Redesign Study Page

**Files:**
- Modify: `src/pages/Study.jsx`

- [ ] **Step 1: Read current `src/pages/Study.jsx`**

```bash
cat src/pages/Study.jsx
```

- [ ] **Step 2: Update Study.jsx**

Keep all state logic. Update JSX:

- Wrap in `PageTransition`
- Mode badge: `bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full` — "📖 学習中"
- Same question number styling as Exam
- Same navigation button styling
- Wrap StudyCard in `AnimatePresence` for question transitions

- [ ] **Step 3: Verify study mode renders with new styling and animations**

- [ ] **Step 4: Commit**

```bash
git add src/pages/Study.jsx
git commit -m "feat: redesign study page with mode badge and page transitions"
```

---

## Task 14: Redesign ScoreCard + Results Page — CountUp, Confetti, Stat Grid

**Files:**
- Modify: `src/components/exam/ScoreCard.jsx`
- Modify: `src/pages/Results.jsx`

- [ ] **Step 1: Read both files**

```bash
cat src/components/exam/ScoreCard.jsx src/pages/Results.jsx
```

- [ ] **Step 2: Update `src/components/exam/ScoreCard.jsx`**

Keep logic. Update JSX:

- Pass result: 🎉 emoji + "合格！" in `text-2xl font-bold text-green-700 dark:text-green-400` + "おめでとうございます"
- Fail result: 😤 emoji + "不合格" in `text-2xl font-bold text-red-700 dark:text-red-400` + "もう一度挑戦しましょう！"
- Score display: use `CountUp` component with `target={score}` — `text-5xl font-extrabold tracking-tight`
- Score bar: `bg-theme-border rounded-full h-1.5` track with gradient fill, pass-line marker
- Stat grid: 3-column grid
  - Correct: `bg-green-50 dark:bg-green-900/20 rounded-xl p-3` — count in green, "正解" label
  - Wrong: `bg-red-50 dark:bg-red-900/20 rounded-xl p-3` — count in red, "不正解" label
  - Unanswered: `bg-surface rounded-xl p-3` — count, "未回答" label
- On pass: trigger confetti after CountUp finishes

Add confetti import and trigger:
```jsx
import confetti from 'canvas-confetti'

// Inside component, after count-up completes:
useEffect(() => {
  if (passed) {
    const timer = setTimeout(() => {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    }, 1600) // after count-up (1500ms) + small delay
    return () => clearTimeout(timer)
  }
}, [passed])
```

- Fail result: add retry button `bg-primary text-white rounded-xl` + "間違えた問題を学習する" link

- [ ] **Step 3: Update `src/pages/Results.jsx`**

Keep logic. Update JSX:

- Wrap in `PageTransition`
- Use `StaggerList` for question review list
- Review items: themed cards with `rounded-xl`, correct/wrong color coding
- Filter toggle: styled pill button

- [ ] **Step 4: Verify results page with count-up and confetti (test with a completed session)**

- [ ] **Step 5: Commit**

```bash
git add src/components/exam/ScoreCard.jsx src/pages/Results.jsx
git commit -m "feat: redesign results page — score count-up, confetti on pass, stat grid"
```

---

## Task 15: Final Polish — Verify All Pages in Both Themes

**Files:** All modified files

- [ ] **Step 1: Run dev server and test every page in light mode**

Verify:
- Home page: categories, test cards, stagger animation
- Login page: gradient background, form styling
- Exam page: timer, progress, question cards, navigation
- Study page: hint card, AI explanation, answer animations
- Results page: count-up, confetti, stat grid

- [ ] **Step 2: Toggle to dark mode and verify every page**

Verify:
- All backgrounds use dark tokens
- Text is readable (no white-on-white, no black-on-black)
- Borders are visible
- Cards have correct surface color
- Gradient accents still look good

- [ ] **Step 3: Test reduced motion**

In browser DevTools → Rendering → Enable "Emulate prefers-reduced-motion: reduce"
Verify: All animations are disabled, everything still functions.

- [ ] **Step 4: Test mobile responsiveness**

DevTools → responsive mode → 375px width. Verify:
- Header doesn't overflow
- Cards stack properly
- Buttons are tappable size
- Timer and progress bar fit

- [ ] **Step 5: Run build to verify no errors**

```bash
npm run build
```

Expected: Clean build, no warnings about unused imports.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete UI redesign — polish pass across all pages and themes"
```
