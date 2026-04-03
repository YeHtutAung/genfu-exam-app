# Phase A: Config & Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Get the app running with `npm run dev`, Tailwind styling working, and Supabase Auth (email + Google + Facebook) functional end-to-end.

**Architecture:** React SPA bootstrapped with Vite. Supabase Auth handles all authentication. Zustand authStore (already complete) manages auth state. Header shows auth-aware nav. All pages wrapped in layout with Header.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, Supabase Auth, Zustand 4, React Router 6

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `src/main.jsx` | React entry point — renders App with CSS import |
| Keep | `src/index.css` | Already has Tailwind directives — no changes needed |
| Keep | `.env.local.example` | Already correct — no changes needed |
| Modify | `src/components/ui/Spinner.jsx` | Animated loading spinner (Tailwind) |
| Modify | `src/components/layout/Header.jsx` | App header with nav links + login/logout |
| Modify | `src/pages/Login.jsx` | Login page — email form + social OAuth buttons |
| Modify | `src/pages/Home.jsx` | Placeholder welcome page |
| Modify | `src/pages/Exam.jsx` | Stub — "Coming soon" placeholder |
| Modify | `src/pages/Study.jsx` | Stub — "Coming soon" placeholder |
| Modify | `src/pages/Results.jsx` | Stub — "Coming soon" placeholder |
| Modify | `src/pages/admin/AdminDashboard.jsx` | Stub — "Admin Dashboard" placeholder |
| Modify | `src/pages/admin/Upload.jsx` | Stub placeholder |
| Modify | `src/pages/admin/UploadPreview.jsx` | Stub placeholder |
| Modify | `src/pages/admin/Tests.jsx` | Stub placeholder |
| Modify | `src/pages/admin/Users.jsx` | Stub placeholder |
| Modify | `src/App.jsx` | Add Header to layout (wrap routes) |

---

## Tasks

### Task 1: Entry Point & Spinner

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/components/ui/Spinner.jsx`

- [ ] **Step 1: Implement main.jsx**
  - Import React, ReactDOM, App, index.css
  - Render App into #root with StrictMode

- [ ] **Step 2: Implement Spinner.jsx**
  - Tailwind-based animated spinner
  - Accept optional `size` prop (default "h-8 w-8")
  - Used by App.jsx loading state (already imported)

- [ ] **Step 3: Commit**
  ```
  feat: add entry point and spinner component
  ```

### Task 2: Header Component

**Files:**
- Modify: `src/components/layout/Header.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Implement Header.jsx**
  - Show app title "原付試験" linking to /
  - If user logged in: show email + "ログアウト" button (calls signOut)
  - If not logged in: show "ログイン" link to /login
  - If admin: show "管理" link to /admin
  - Use Tailwind for styling (sticky top bar, white bg, shadow)

- [ ] **Step 2: Add Header to App.jsx layout**
  - Import Header
  - Wrap route content with Header (show on all routes except login)

- [ ] **Step 3: Commit**
  ```
  feat: add header with auth-aware navigation
  ```

### Task 3: Login Page

**Files:**
- Modify: `src/pages/Login.jsx`

- [ ] **Step 1: Implement Login.jsx**
  - Email + password form (signInWithEmail)
  - Google sign-in button (signInWithGoogle)
  - Facebook sign-in button (signInWithFacebook)
  - Error display from authStore
  - Redirect to / on successful login (useNavigate)
  - If already logged in, redirect to /
  - Japanese labels: メールアドレス, パスワード, ログイン, Googleでログイン, Facebookでログイン

- [ ] **Step 2: Commit**
  ```
  feat: add login page with email and social auth
  ```

### Task 4: Home Page Placeholder

**Files:**
- Modify: `src/pages/Home.jsx`

- [ ] **Step 1: Implement Home.jsx**
  - Simple welcome message with Header
  - Show user's email
  - "原付免許 模擬試験" heading
  - Placeholder text: "試験カテゴリーは近日公開予定です"

- [ ] **Step 2: Commit**
  ```
  feat: add placeholder home page
  ```

### Task 5: Stub Pages (so App.jsx doesn't crash)

**Files:**
- Modify: `src/pages/Exam.jsx`
- Modify: `src/pages/Study.jsx`
- Modify: `src/pages/Results.jsx`
- Modify: `src/pages/admin/AdminDashboard.jsx`
- Modify: `src/pages/admin/Upload.jsx`
- Modify: `src/pages/admin/UploadPreview.jsx`
- Modify: `src/pages/admin/Tests.jsx`
- Modify: `src/pages/admin/Users.jsx`

- [ ] **Step 1: Add default exports to all stub pages**
  - Each returns a simple div with the page name
  - Pattern: `export default function PageName() { return <div>PageName — Coming Soon</div> }`

- [ ] **Step 2: Commit**
  ```
  feat: add stub pages for all routes
  ```

### Task 6: Install Dependencies & Verify

- [ ] **Step 1: Run npm install**
- [ ] **Step 2: Run npm run dev**
- [ ] **Step 3: Verify app loads without errors**
- [ ] **Step 4: Final commit if any fixes needed**
