# CLAUDE.md — Genfu Exam App
> Claude Code reads this file automatically at the start of every session.
> This is the single source of truth for all project decisions.

---

## Project Overview

A multi-user Japanese driving license (原付/二輪) practice exam web app.
Users can take timed mock exams or study question by question with AI explanations.
Admins manage content by uploading ZIP bundles containing JSON + images.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Routing | React Router v6 |
| Backend | Vercel Edge Functions |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI | Anthropic Claude Sonnet via Edge Function proxy |
| Hosting | Vercel |

---

## Architecture

```
Browser (React SPA)
    ↓ HTTPS
Vercel Edge Functions
  /api/explain          → Anthropic API (AI proxy, key never exposed to browser)
  /api/upload-bundle    → unpack ZIP, validate, preview
  /api/confirm-upload   → write to Supabase DB + Storage
    ↓ HTTPS
Supabase
  Auth (email + Google + Facebook)
  Postgres DB (questions, tests, users, sessions, scores)
  Storage (scenario PNG images)
```

---

## User Roles

### User
- Register / login (email, Google, Facebook)
- Take exams (timed, 30 min, 48 questions)
- Study mode (question by question, AI explanation on demand)
- View personal score history across devices

### Admin
- Protected route: /admin (role check on login)
- Upload ZIP bundle to add new tests
- Enable / disable tests
- View all user progress and scores

---

## Routing Structure

```
/                    → Home (category selector)
/login               → Login (email + social)
/exam/:testId        → Exam mode
/study/:testId       → Study mode
/results/:sessionId  → Results + review
/admin               → Admin dashboard (role: admin only)
/admin/upload        → ZIP bundle upload
/admin/upload/preview → Upload preview + confirm
/admin/tests         → Manage tests (enable/disable)
/admin/users         → View users + progress
```

---

## Database Schema

```sql
-- Users (extended from Supabase Auth)
profiles
  id uuid references auth.users primary key
  email text
  role text check (role in ('admin', 'user')) default 'user'
  created_at timestamptz default now()

-- License categories
categories
  id uuid primary key
  code text unique  -- genfu | futsu_bike | daigata_bike | futsu_car
  name_jp text
  name_en text
  active boolean default true

-- Test sets
tests
  id uuid primary key
  category_id uuid references categories
  test_number integer
  title_jp text
  time_limit integer  -- seconds (1800 = 30 min)
  pass_score integer
  total_points integer
  active boolean default false
  created_at timestamptz default now()

-- Questions
questions
  id uuid primary key
  test_id uuid references tests
  question_number integer
  type text check (type in ('standard', 'scenario'))
  question_jp text
  answer boolean        -- null for scenario type (answer is in sub_questions)
  hint_jp text
  points integer        -- 1 for standard, 2 for scenario
  image_render text check (image_render in ('css', 'static', null))
  sign_code text        -- used when image_render = 'css'
  image_url text        -- used when image_render = 'static' (Supabase Storage URL)
  image_alt text

-- Sub-questions (for scenario type only)
sub_questions
  id uuid primary key
  question_id uuid references questions
  sub_number integer
  text_jp text
  answer boolean

-- Exam sessions
exam_sessions
  id uuid primary key
  user_id uuid references profiles
  test_id uuid references tests
  mode text check (mode in ('exam', 'study'))
  started_at timestamptz default now()
  completed_at timestamptz
  score integer
  passed boolean

-- Individual answers per session
answers
  id uuid primary key
  session_id uuid references exam_sessions
  question_id uuid references questions
  sub_question_id uuid references sub_questions  -- null for standard questions
  user_answer boolean
  is_correct boolean
```

---

## Image Handling — Option D Hybrid

Two render strategies based on `image_render` field in questions table:

### CSS render (`image_render = 'css'`)
Standard Japanese road signs rendered as React CSS components.
Component: `src/components/signs/SignRenderer.jsx`
Takes `sign_code` prop and renders the correct sign.

**Supported sign_codes (from test_03 reference):**
| sign_code | Description |
|---|---|
| signal_yellow | Yellow traffic light |
| left_turn_permitted | Blue rectangle with white left arrow |
| signal_arrow_right | Red light with blue right turn arrow |
| yellow_lane_divider | Yellow lane dividing line diagram |
| dedicated_lane | Blue 専用 lane sign |
| pedestrian_crossing_marking | Diamond road marking pattern |
| speed_max_20 | Maximum speed 20km/h marking |
| school_zone_warning | Yellow diamond school zone sign |

### Static render (`image_render = 'static'`)
Complex illustrations served from Supabase Storage.
Component: `src/components/signs/ImageRenderer.jsx`
Renders `<img>` tag with `image_url` from Supabase Storage.

**Used for:**
- Police officer hand signal illustrations
- Driving scenario scenes (問47, 問48 style)

### ImageRenderer logic
```jsx
// src/components/signs/ImageRenderer.jsx
if (question.image_render === 'css') return <SignRenderer signCode={question.sign_code} />
if (question.image_render === 'static') return <img src={question.image_url} alt={question.image_alt} />
return null
```

---

## Content Upload Pipeline — ZIP Bundle

Admin uploads a ZIP file per test. Structure:
```
test_03.zip
  ├── test_03.json
  └── /images
        ├── q03_fig_04.png   (police hand signal)
        ├── q03_fig_47.png   (scenario scene)
        └── q03_fig_48.png   (scenario scene)
```

### ZIP Validation Rules (enforced in /api/upload-bundle)
- ZIP must contain exactly one .json at root level
- JSON must pass full schema validation
- All questions with image_render = 'static' must have matching PNG in /images/
- Images must be .png only
- Max ZIP size: 50MB
- Max single image: 5MB
- No duplicate question IDs

### On confirm upload
- Images → Supabase Storage at `/exam-images/{category}/{test_id}/`
- `image_url` fields auto-updated with Supabase public URL
- Questions inserted to DB in transaction

---

## JSON Schema Reference

See `/reference/test_03.json` for the full working example.

Key fields:
```json
{
  "meta": {
    "test_id": "genfu_03",
    "category": "genfu",
    "test_number": 3,
    "time_limit": 1800,
    "pass_score": 45,
    "total_points": 50
  },
  "questions": [
    {
      "id": "q03_001",
      "question_number": 1,
      "type": "standard",
      "question_jp": "...",
      "answer": true,
      "hint_jp": "...",
      "image": null,
      "points": 1
    },
    {
      "id": "q03_047",
      "question_number": 47,
      "type": "scenario",
      "question_jp": "...",
      "image": { "render": "static", "src": "/assets/q03_fig_47.png", "alt": "..." },
      "sub_questions": [
        { "id": "q03_047_1", "sub_number": 1, "text_jp": "...", "answer": true },
        { "id": "q03_047_2", "sub_number": 2, "text_jp": "...", "answer": true },
        { "id": "q03_047_3", "sub_number": 3, "text_jp": "...", "answer": true }
      ],
      "points": 2
    }
  ]
}
```

---

## Exam Scoring Rules

- Questions 1-46: 1 point each
- Questions 47-48: 2 points each (only if ALL 3 sub-questions correct, otherwise 0)
- Total: 50 points
- Pass: 45 points or above
- Time limit: 30 minutes

---

## Supabase Storage Structure

```
/exam-images
  /genfu
    /test_03
      q03_fig_04.png
      q03_fig_47.png
      q03_fig_48.png
  /futsu_bike
    /test_01
      ...
```

---

## Environment Variables

```
# .env.local (never commit)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=        # server-side only, Vercel env var
```

---

## Content Categories (Phase Plan)

| Code | Name JP | Name EN | Phase |
|---|---|---|---|
| genfu | 原付 | Moped | 1 |
| futsu_bike | 普通二輪 | Standard Motorcycle | 1 (focus) |
| daigata_bike | 大型二輪 | Large Motorcycle | 1 |
| futsu_car | 普通自動車 | Standard Car | 2 |

---

## Key Conventions

- All Japanese text fields end in `_jp`
- Question IDs follow pattern: `q{test_number:02d}_{question_number:03d}`
- Sub-question IDs: `q{test_number:02d}_{question_number:03d}_{sub_number}`
- Sign codes use snake_case
- Supabase RLS enabled on all tables
- Admin routes protected by role check in ProtectedRoute component
- Edge Functions handle all Anthropic API calls — never call Anthropic from the browser directly

---

## Reference Files

| File | Purpose |
|---|---|
| `/reference/test_03.json` | Full working question bank — use as schema reference |
| `/docs/architecture.md` | Full system design |
| `/docs/image-handling.md` | Option D hybrid image approach |
| `/docs/admin-pipeline.md` | ZIP upload pipeline detail |
| `/supabase/migrations/001_initial_schema.sql` | DB schema |

---

## Project Structure

```
genfu-exam-app/
├── package.json                React 18, Vite, Tailwind, Zustand, Supabase, React Router v6
├── vite.config.js              Vite build config with @vitejs/plugin-react
├── tailwind.config.js          Tailwind content paths covering src/**/*.{js,jsx}
├── postcss.config.js           PostCSS with tailwindcss + autoprefixer plugins
├── vercel.json                 Edge Functions runtime config + SPA rewrite rules
├── index.html                  HTML entry point — mounts #root, lang="ja"
├── .gitignore                  Ignores node_modules, dist, .env.local
├── .env.local.example          Template for local env vars (never commit .env.local)
│
├── api/                        Vercel Edge Functions — server-side only, Anthropic key never exposed to browser
│   ├── explain.js              POST /api/explain — proxies question to Claude Sonnet, streams explanation back
│   ├── upload-bundle.js        POST /api/upload-bundle — accepts multipart ZIP, unpacks, validates schema + images, returns preview payload
│   └── confirm-upload.js       POST /api/confirm-upload — writes validated questions to Supabase DB and uploads images to Storage
│
├── src/
│   ├── main.jsx                Entry point — renders App into #root
│   ├── App.jsx                 Root component — sets up React Router routes
│   ├── index.css               Tailwind directives (@tailwind base/components/utilities)
│   │
│   ├── pages/
│   │   ├── Home.jsx            /  — Category selector (genfu, futsu_bike, daigata_bike, futsu_car)
│   │   ├── Login.jsx           /login — Email + Google + Facebook auth via Supabase
│   │   ├── Exam.jsx            /exam/:testId — Timed exam mode (30 min, 48 questions)
│   │   ├── Study.jsx           /study/:testId — Study mode (question by question, AI explanation on demand)
│   │   ├── Results.jsx         /results/:sessionId — Score summary + question review
│   │   └── admin/
│   │       ├── AdminDashboard.jsx  /admin — Admin dashboard (role: admin only)
│   │       ├── Upload.jsx          /admin/upload — ZIP bundle upload form
│   │       ├── UploadPreview.jsx   /admin/upload/preview — Preview parsed bundle before confirm
│   │       ├── Tests.jsx           /admin/tests — Enable / disable tests
│   │       └── Users.jsx           /admin/users — View all users + their progress / scores
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx          Site header — nav links + auth state
│   │   │   ├── Footer.jsx          Site footer
│   │   │   └── ProtectedRoute.jsx  Wraps routes that require auth or admin role; redirects to /login or / if wrong role
│   │   ├── signs/
│   │   │   ├── SignRenderer.jsx    Renders Japanese road signs as CSS components; prop: signCode
│   │   │   └── ImageRenderer.jsx   Hybrid dispatcher: css → SignRenderer, static → <img>, null → null
│   │   ├── exam/
│   │   │   ├── QuestionCard.jsx    Renders a single question (standard or scenario) with answer controls
│   │   │   ├── Timer.jsx           Countdown timer — 30 min (1800 s), triggers auto-submit on expiry
│   │   │   ├── ProgressBar.jsx     Shows answered / total question progress
│   │   │   └── ScoreCard.jsx       Displays final score, pass/fail, and per-question breakdown
│   │   ├── study/
│   │   │   ├── StudyCard.jsx       Single question card for study mode — reveals correct answer + hint after user answers
│   │   │   └── AIExplanation.jsx   Fetches and streams AI explanation from /api/explain; shown on demand
│   │   ├── admin/
│   │   │   ├── UploadForm.jsx      ZIP file picker + submit — calls /api/upload-bundle
│   │   │   ├── UploadPreview.jsx   Shows parsed bundle contents before confirm; confirm calls /api/confirm-upload
│   │   │   ├── TestList.jsx        Table of tests with enable/disable toggle
│   │   │   └── UserList.jsx        Table of users with score history and progress
│   │   └── ui/
│   │       ├── Button.jsx          Shared button component
│   │       ├── Modal.jsx           Shared modal / dialog component
│   │       └── Spinner.jsx         Loading spinner
│   │
│   ├── store/
│   │   ├── authStore.js        Zustand — auth state (user, role, session)
│   │   ├── examStore.js        Zustand — active exam session state (questions, answers, timer, mode)
│   │   └── adminStore.js       Zustand — admin state (upload bundle preview, test list)
│   │
│   ├── lib/
│   │   ├── supabase.js         Supabase client — initialised with VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
│   │   └── api.js              Fetch wrappers for Edge Functions: explain(), uploadBundle(), confirmUpload()
│   │
│   └── hooks/
│       ├── useAuth.js          Subscribes to Supabase auth state changes, syncs to authStore
│       ├── useExam.js          Loads questions for a testId, manages exam session lifecycle
│       └── useAdmin.js         Admin data fetching (tests, users, scores)
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  DB schema — profiles, categories, tests, questions, sub_questions, exam_sessions, answers
│
└── reference/
    └── test_03.json            Full working question bank — canonical schema reference
```

---

## Implementation Status

### Config & Bootstrap
| File | Status |
|---|---|
| `package.json` | complete |
| `vite.config.js` | complete |
| `tailwind.config.js` | complete |
| `postcss.config.js` | complete |
| `vercel.json` | complete |
| `index.html` | complete |
| `src/main.jsx` | complete |
| `src/App.jsx` | complete |
| `src/index.css` | complete |

### Supabase
| File | Status |
|---|---|
| `supabase/migrations/001_initial_schema.sql` | complete |
| `src/lib/supabase.js` | complete |

### Auth
| File | Status |
|---|---|
| `src/store/authStore.js` | complete |
| `src/hooks/useAuth.js` | complete |
| `src/pages/Login.jsx` | complete |
| `src/components/layout/ProtectedRoute.jsx` | complete |

### Layout
| File | Status |
|---|---|
| `src/components/layout/Header.jsx` | complete |
| `src/components/layout/Footer.jsx` | pending |

### Shared UI
| File | Status |
|---|---|
| `src/components/ui/Button.jsx` | pending |
| `src/components/ui/Modal.jsx` | complete |
| `src/components/ui/Spinner.jsx` | complete |

### Image / Signs
| File | Status |
|---|---|
| `src/components/signs/SignRenderer.jsx` | complete |
| `src/components/signs/ImageRenderer.jsx` | complete |

### Exam Mode
| File | Status |
|---|---|
| `src/store/examStore.js` | complete |
| `src/hooks/useExam.js` | complete |
| `src/lib/api.js` | complete |
| `src/pages/Home.jsx` | complete |
| `src/pages/Exam.jsx` | complete |
| `src/pages/Study.jsx` | complete |
| `src/pages/Results.jsx` | complete |
| `src/components/exam/QuestionCard.jsx` | complete |
| `src/components/exam/Timer.jsx` | complete |
| `src/components/exam/ProgressBar.jsx` | complete |
| `src/components/exam/ScoreCard.jsx` | complete |
| `src/components/study/StudyCard.jsx` | complete |
| `src/components/study/AIExplanation.jsx` | complete |

### Edge Functions
| File | Status |
|---|---|
| `api/explain.js` | pending |
| `api/upload-bundle.js` | pending |
| `api/confirm-upload.js` | pending |

### Admin
| File | Status |
|---|---|
| `src/store/adminStore.js` | pending |
| `src/hooks/useAdmin.js` | pending |
| `src/pages/admin/AdminDashboard.jsx` | complete |
| `src/pages/admin/Upload.jsx` | complete |
| `src/pages/admin/UploadPreview.jsx` | complete |
| `src/pages/admin/Tests.jsx` | complete |
| `src/pages/admin/Users.jsx` | complete |
| `src/components/admin/UploadForm.jsx` | complete |
| `src/components/admin/UploadPreview.jsx` | complete |
| `src/components/admin/TestList.jsx` | complete |
| `src/components/admin/UserList.jsx` | complete |
