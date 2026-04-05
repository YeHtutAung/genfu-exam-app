# Shared UI + Admin Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 4 remaining pending files — `Button.jsx`, `Footer.jsx`, `adminStore.js`, `useAdmin.js` — and refactor admin pages to use the centralized store.

**Architecture:** Two small shared UI components (Button, Footer) with no dependencies, followed by a flat Zustand admin store that centralizes all admin data fetching and upload pipeline state, a `useAdmin(section)` hook that auto-fetches on mount, and refactors of 5 admin pages to drop inline fetching.

**Tech Stack:** React, Zustand, Supabase client, React Router v6, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-04-05-shared-ui-and-admin-layer-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/components/ui/Button.jsx` | Create | Thin wrapper — base classes + passthrough |
| `src/components/layout/Footer.jsx` | Create | Minimal one-liner footer, hides on exam/study routes |
| `src/App.jsx` | Modify | Add Footer below AnimatePresence in AppRoutes |
| `src/store/adminStore.js` | Create | Flat Zustand store: stats, tests, users, uploadPreview |
| `src/hooks/useAdmin.js` | Create | `useAdmin(section)` — auto-fetches, returns data/loading/error/refetch |
| `src/pages/admin/AdminDashboard.jsx` | Modify | Replace inline fetch with `useAdmin('stats')` |
| `src/pages/admin/Tests.jsx` | Modify | Replace inline fetch with `useAdmin('tests')` + store actions |
| `src/pages/admin/Users.jsx` | Modify | Replace inline fetch with `useAdmin('users')` |
| `src/pages/admin/Upload.jsx` | Modify | Replace `location.state` pass with `setUploadPreview` |
| `src/pages/admin/UploadPreview.jsx` | Modify | Replace `location.state` read with `adminStore.uploadPreview` |
| `CLAUDE.md` | Modify | Mark 4 files complete |

---

## Task 1: Create Button.jsx

**Files:**
- Create: `src/components/ui/Button.jsx`

- [ ] **Step 1: Create the component**

Create `src/components/ui/Button.jsx`:

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

- [ ] **Step 2: Verify build**

Run: `npx vite build 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Button.jsx
git commit -m "feat: add Button shared component — thin wrapper with base styles"
```

---

## Task 2: Create Footer.jsx

**Files:**
- Create: `src/components/layout/Footer.jsx`

- [ ] **Step 1: Create the component**

Create `src/components/layout/Footer.jsx`:

```jsx
import { useLocation } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'

export default function Footer() {
  const location = useLocation()

  const hidden = ['/login'].includes(location.pathname)
    || location.pathname.startsWith('/exam/')
    || (location.pathname.startsWith('/study/') && !location.pathname.includes('/summary/'))

  if (hidden) return null

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

- [ ] **Step 2: Verify build**

Run: `npx vite build 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Footer.jsx
git commit -m "feat: add Footer component — minimal one-liner, hidden on exam/study routes"
```

---

## Task 3: Wire Footer into App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add Footer import**

In `src/App.jsx`, after the `Header` import (line 7), add:

```jsx
import Footer from './components/layout/Footer'
```

- [ ] **Step 2: Add Footer to AppRoutes**

In the `AppRoutes` function, add `<Footer />` after the closing `</AnimatePresence>` tag (after line 71):

```jsx
  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* ... all routes unchanged ... */}
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  )
```

- [ ] **Step 3: Verify build**

Run: `npx vite build 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add Footer to root layout"
```

---

## Task 4: Create adminStore.js

**Files:**
- Create: `src/store/adminStore.js`

- [ ] **Step 1: Create the store**

Create `src/store/adminStore.js`:

```js
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
    const { data: sessions } = await supabase
      .from('exam_sessions')
      .select('user_id, score')
      .eq('mode', 'exam')
      .not('score', 'is', null)
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
    await supabase.from('tests').update({ active }).eq('id', testId)
    await get().fetchTests()
  },

  deleteTest: async (testId) => {
    await supabase.from('tests').delete().eq('id', testId)
    await get().fetchTests()
  },

  setUploadPreview: (payload) => set({ uploadPreview: payload }),
  clearUploadPreview: () => set({ uploadPreview: null }),
}))

export default useAdminStore
```

- [ ] **Step 2: Verify build**

Run: `npx vite build 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/store/adminStore.js
git commit -m "feat: add adminStore — centralized admin data with per-section loading/error state"
```

---

## Task 5: Create useAdmin.js

**Files:**
- Create: `src/hooks/useAdmin.js`

- [ ] **Step 1: Create the hook**

Create `src/hooks/useAdmin.js`:

```js
import { useEffect } from 'react'
import useAdminStore from '../store/adminStore'

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

- [ ] **Step 2: Verify build**

Run: `npx vite build 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAdmin.js
git commit -m "feat: add useAdmin hook — auto-fetch by section with data/loading/error/refetch"
```

---

## Task 6: Refactor AdminDashboard.jsx

**Files:**
- Modify: `src/pages/admin/AdminDashboard.jsx`

- [ ] **Step 1: Replace the file**

Replace `src/pages/admin/AdminDashboard.jsx` with:

```jsx
import { Link } from 'react-router-dom'
import useAdmin from '../../hooks/useAdmin'
import Spinner from '../../components/ui/Spinner'

export default function AdminDashboard() {
  const { data: stats, loading, error } = useAdmin('stats')

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">管理ダッシュボード</h1>

      {error && <p className="mb-4 text-sm text-wrong">{error}</p>}

      {stats && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="ユーザー数" value={stats.users} />
            <StatCard label="テスト数" value={stats.tests} />
            <StatCard label="受験回数" value={stats.sessions} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <QuickLink to="/admin/tests" title="テスト管理" desc="テストの有効化・無効化・削除" />
            <QuickLink to="/admin/users" title="ユーザー管理" desc="ユーザー一覧と成績確認" />
            <QuickLink to="/admin/upload" title="テストアップロード" desc="ZIPバンドルで新規テスト追加" />
            <QuickLink to="/admin/images" title="問題画像" desc="既存の問題に画像をアップロード" />
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 text-center shadow-sm">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}

function QuickLink({ to, title, desc }) {
  return (
    <Link
      to={to}
      className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
    >
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </Link>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/AdminDashboard.jsx
git commit -m "refactor: AdminDashboard — replace inline fetch with useAdmin('stats')"
```

---

## Task 7: Refactor Tests.jsx

**Files:**
- Modify: `src/pages/admin/Tests.jsx`

- [ ] **Step 1: Replace the file**

Replace `src/pages/admin/Tests.jsx` with:

```jsx
import { useState } from 'react'
import useAdmin from '../../hooks/useAdmin'
import useAdminStore from '../../store/adminStore'
import TestList from '../../components/admin/TestList'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

export default function Tests() {
  const { data: tests, loading, error } = useAdmin('tests')
  const categories = useAdminStore(s => s.categories)
  const toggleTestActive = useAdminStore(s => s.toggleTestActive)
  const deleteTest = useAdminStore(s => s.deleteTest)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteTest(deleteTarget.id)
    setDeleteTarget(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">テスト管理</h1>

      {error && <p className="mb-4 text-sm text-wrong">{error}</p>}

      {tests.length === 0 ? (
        <p className="py-12 text-center text-gray-500">テストがありません</p>
      ) : (
        <TestList
          tests={tests}
          categories={categories}
          onToggleActive={toggleTestActive}
          onDelete={setDeleteTarget}
        />
      )}

      <Modal
        isOpen={!!deleteTarget}
        title="テストを削除"
        message={`「${deleteTarget?.title_jp || `テスト第${deleteTarget?.test_number}回`}」を削除しますか？この操作は取り消せません。`}
        confirmLabel="削除する"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/Tests.jsx
git commit -m "refactor: Tests — replace inline fetch with useAdmin('tests') and store actions"
```

---

## Task 8: Refactor Users.jsx

**Files:**
- Modify: `src/pages/admin/Users.jsx`

- [ ] **Step 1: Replace the file**

Replace `src/pages/admin/Users.jsx` with:

```jsx
import { useState } from 'react'
import useAdmin from '../../hooks/useAdmin'
import UserList from '../../components/admin/UserList'
import Spinner from '../../components/ui/Spinner'

export default function Users() {
  const { data: users, loading, error } = useAdmin('users')
  const [roleFilter, setRoleFilter] = useState('all')

  const filtered = roleFilter === 'all'
    ? (users || [])
    : (users || []).filter(u => u.role === roleFilter)

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">ユーザー管理</h1>

      {error && <p className="mb-4 text-sm text-wrong">{error}</p>}

      <div className="mb-4 flex gap-2">
        {['all', 'user', 'admin'].map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              roleFilter === r
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {r === 'all' ? 'すべて' : r === 'admin' ? '管理者' : '一般'}
          </button>
        ))}
        <span className="ml-2 self-center text-sm text-gray-400">
          {filtered.length}件
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-gray-500">ユーザーがいません</p>
      ) : (
        <UserList users={filtered} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/Users.jsx
git commit -m "refactor: Users — replace inline fetch with useAdmin('users')"
```

---

## Task 9: Refactor Upload pipeline (Upload.jsx + UploadPreview.jsx)

**Files:**
- Modify: `src/pages/admin/Upload.jsx`
- Modify: `src/pages/admin/UploadPreview.jsx`

**Context:** Currently `Upload.jsx` passes bundle data via `navigate(..., { state: { preview } })` and `UploadPreview.jsx` reads from `useLocation().state`. This migrates that to use `adminStore.uploadPreview` so the data survives page refreshes and is centrally managed.

- [ ] **Step 1: Update Upload.jsx**

Replace `src/pages/admin/Upload.jsx` with:

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadBundle } from '../../lib/api'
import useAdminStore from '../../store/adminStore'
import UploadForm from '../../components/admin/UploadForm'

export default function Upload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const setUploadPreview = useAdminStore(s => s.setUploadPreview)

  const handleUpload = async (formData) => {
    setUploading(true)
    setError(null)
    try {
      const preview = await uploadBundle(formData)
      setUploadPreview(preview)
      navigate('/admin/upload/preview')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">テストアップロード</h1>
      <p className="mb-6 text-sm text-gray-500">
        ZIPバンドル（JSON + 画像）をアップロードして新しいテストを追加します。
      </p>

      <UploadForm onUpload={handleUpload} uploading={uploading} />

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update UploadPreview.jsx**

Replace `src/pages/admin/UploadPreview.jsx` with:

```jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { confirmUpload } from '../../lib/api'
import useAdminStore from '../../store/adminStore'
import UploadPreviewPanel from '../../components/admin/UploadPreview'

export default function UploadPreview() {
  const navigate = useNavigate()
  const preview = useAdminStore(s => s.uploadPreview)
  const clearUploadPreview = useAdminStore(s => s.clearUploadPreview)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState(null)
  const [categoryId, setCategoryId] = useState(null)

  // Resolve category code → UUID
  useEffect(() => {
    if (!preview?.meta?.category) return
    supabase
      .from('categories')
      .select('id')
      .eq('code', preview.meta.category)
      .single()
      .then(({ data }) => {
        if (data) setCategoryId(data.id)
      })
  }, [preview?.meta?.category])

  // If no preview data (e.g. direct navigation), redirect back
  if (!preview) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <p className="text-gray-500">プレビューデータがありません。</p>
        <button
          onClick={() => navigate('/admin/upload')}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          アップロードに戻る
        </button>
      </div>
    )
  }

  const handleConfirm = async () => {
    if (!categoryId) {
      setError(`カテゴリ "${preview.meta.category}" が見つかりません`)
      return
    }
    setConfirming(true)
    setError(null)
    try {
      await confirmUpload({ ...preview, categoryId })
      clearUploadPreview()
      navigate('/admin/tests')
    } catch (err) {
      setError(err.message)
    } finally {
      setConfirming(false)
    }
  }

  const handleCancel = () => {
    clearUploadPreview()
    navigate('/admin/upload')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">アップロードプレビュー</h1>

      <UploadPreviewPanel
        preview={preview}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirming={confirming}
      />

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npx vite build 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/Upload.jsx src/pages/admin/UploadPreview.jsx
git commit -m "refactor: upload pipeline — use adminStore.uploadPreview instead of location.state"
```

---

## Task 10: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Mark 4 files complete**

In `CLAUDE.md`, under the Implementation Status sections, update the following rows from `pending` to `complete`:

- Under **Shared UI**: `src/components/ui/Button.jsx`
- Under **Layout**: `src/components/layout/Footer.jsx`
- Under **Admin** (or create if missing): `src/store/adminStore.js`, `src/hooks/useAdmin.js`

- [ ] **Step 2: Verify build one final time**

Run: `npx vite build 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: mark Button, Footer, adminStore, useAdmin as complete in CLAUDE.md"
```
