# UI Redesign — Full Visual Polish

**Date:** 2026-04-04
**Status:** Approved
**Scope:** Full redesign of all pages — visual polish + minor layout improvements

---

## Design Decisions

| Decision | Choice |
|---|---|
| Direction | Modern / Friendly — soft blues, rounded corners, approachable |
| Scope | Full redesign, all pages |
| Animation | Rich — Framer Motion, page transitions, confetti, skeletons |
| Theme | Dark + light mode with system preference, user toggle |
| Typography | Inter (UI/numbers) + Noto Sans JP (Japanese text) |
| Layout | Visual polish + minor layout improvements (no structural changes) |
| Implementation | Custom Tailwind theme + Framer Motion (no component library) |

---

## Dependencies

| Package | Purpose | Size (gzipped) |
|---|---|---|
| `framer-motion` | Animations, page transitions, gestures | ~15KB |
| `canvas-confetti` | Confetti burst on exam pass | ~3KB |
| Google Fonts: Inter | UI typography (400, 500, 600, 700) | Variable font ~30KB |
| Google Fonts: Noto Sans JP | Japanese text (400, 500, 700) — use variable font URL | ~100-200KB (subset) |

---

## Design System

### Color Palette

CSS custom properties on `:root` (light) and `.dark` (dark). Tailwind maps via `tailwind.config.js` using `var()` references.

#### Light Mode

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#FFFFFF` | Page background |
| `--surface` | `#F8FAFC` | Cards, panels |
| `--primary` | `#3B82F6` | Actions, links, selected state |
| `--primary-hover` | `#2563EB` | Button hover |
| `--text-primary` | `#0F172A` | Headings, body text |
| `--text-secondary` | `#64748B` | Descriptions, secondary content |
| `--correct` | `#22C55E` | Correct answers, pass state |
| `--wrong` | `#EF4444` | Wrong answers, fail state |
| `--ai` | `#8B5CF6` | AI explanation feature |
| `--warning` | `#F59E0B` | Timer low warning |
| `--border` | `#E2E8F0` | Borders, dividers |

#### Dark Mode

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0F172A` | Page background |
| `--surface` | `#1E293B` | Cards, panels |
| `--primary` | `#60A5FA` | Brighter blue for dark background |
| `--primary-hover` | `#93BBFD` | Button hover |
| `--text-primary` | `#F1F5F9` | Headings, body text |
| `--text-secondary` | `#94A3B8` | Descriptions |
| `--correct` | `#4ADE80` | Correct answers |
| `--wrong` | `#F87171` | Wrong answers |
| `--ai` | `#A78BFA` | AI explanation |
| `--warning` | `#FBBF24` | Timer warning |
| `--border` | `#334155` | Borders |

### Dark Mode Strategy

- Tailwind `darkMode: 'class'` — `.dark` class on `<html>`
- CSS custom properties in `src/index.css` for `:root` and `.dark`
- Toggle button in Header saves preference to `localStorage`
- On first visit, respects `prefers-color-scheme` media query
- Tailwind config maps semantic tokens: `colors: { bg: 'var(--bg)', surface: 'var(--surface)', ... }`

### Typography

| Role | Font | Weight | Tailwind Class |
|---|---|---|---|
| Page title | Inter | 700 | `text-3xl font-bold tracking-tight` |
| Section heading | Inter | 600 | `text-xl font-semibold` |
| Question text (JP) | Noto Sans JP | 500 | `text-lg font-medium leading-relaxed` |
| Body / descriptions | Inter | 400 | `text-sm text-secondary leading-relaxed` |
| Timer display | System monospace (SF Mono / ui-monospace) | 700 | `font-mono text-xl font-bold tabular-nums` |
| Labels | Inter | 600 | `text-xs font-semibold uppercase tracking-wide` |

Font loading: Google Fonts via `<link>` in `index.html` with `display=swap`.

### Component Patterns

**Buttons:**
- Primary: `bg-primary text-white rounded-xl px-5 py-2.5 font-medium shadow-sm shadow-primary/30`
- Secondary: `bg-white text-primary border-1.5 border-primary rounded-xl`
- Ghost: `bg-surface text-text-secondary rounded-xl`
- All buttons: hover scale 1.02, shadow lift (150ms transition)

**Cards:**
- `bg-white dark:bg-surface border border-border rounded-xl p-4 shadow-sm`
- Selected state: `border-2 border-primary ring-3 ring-primary/10`

**Inputs:**
- `border-1.5 border-border rounded-xl px-3.5 py-2.5`
- Focus: `border-primary ring-3 ring-primary/10`

**Answer buttons (exam/study):**
- Unselected: `bg-white border-1.5 border-border rounded-xl`
- Selected: `border-2 border-primary ring-3 ring-primary/10 text-primary font-semibold`
- Correct (review): `bg-correct/5 border-2 border-correct text-correct`
- Wrong (review): `bg-wrong/5 border-2 border-wrong text-wrong`

---

## Page Designs

### 1. Header

**Changes from current:**
- Branded logo mark: gradient blue square with "G" + "Genfu" text
- Active nav link highlighted in primary color
- Dark mode toggle button (sun/moon icon)
- User avatar circle with initials (from profile)
- Subtle bottom shadow for depth

### 2. Home / Category Selection

**Changes from current:**
- Section label above title ("Practice Tests" in primary color)
- Subtitle below main heading
- Category buttons: selected gets gradient fill + shadow, unselected gets border outline
- Category icons (emoji): 🛵 原付, 🏍️ 二輪, 🚗 自動車
- Test cards redesigned:
  - Previous score badge (green if passed, gray if untaken)
  - Pass requirement shown (`合格: 45点`)
  - Separate exam/study mode buttons per card
  - `rounded-xl` with subtle shadow
- Staggered entrance animation for card list

### 3. Login Page

**Changes from current:**
- Gradient background (blue → slate → purple, subtle)
- Branded logo above form
- Welcome text: `おかえりなさい` + subtitle
- Form in frosted white card with larger shadow
- Rounded inputs with 1.5px border
- Primary button with gradient + shadow
- Clean divider line with "または" text
- Social buttons styled consistently (Google, Facebook)
- Fade-in entrance animation

### 4. Exam Mode

**Changes from current:**
- Question number: larger, bolder with label prefix
- Timer in pill container with clock icon, monospace font
- Progress bar: gradient fill (blue), thicker (6px), rounded
- Question card: `rounded-xl`, type label ("標準問題 · 1点"), larger padding
- Answer buttons: larger, `rounded-xl`, selected ring glow
- Navigation: ghost "前へ" on left, primary "次へ" on right
- Question grid (desktop): same layout but with rounded buttons and color states
- Card slides left/right on question change (Framer Motion AnimatePresence)

### 5. Study Mode

**Changes from current:**
- Mode badge ("📖 学習中") in header area
- After answering:
  - Your answer labeled ("← あなたの回答")
  - Correct answer marked with ✓
  - Wrong answer shakes, correct answer pulses
- Hint card: warm yellow background (`bg-amber-50 border-amber-200`), 💡 icon
- AI explanation card: purple gradient background, ✨ sparkle icon, branded feel
- Each section reveals with height expand + fade-in animation (spring physics)

### 6. Results Page

**Pass result:**
- 🎉 emoji + "合格！" + congratulations text
- Score in large card: count-up animation from 0 to final score (1.5s)
- Score bar with gradient fill and pass-line marker
- Confetti burst (canvas-confetti) triggered after count-up completes
- Stat cards grid: correct (green), wrong (red), unanswered (gray)

**Fail result:**
- 😤 emoji + "不合格" + encouragement text
- Same score card and stat grid
- Prominent retry CTA button
- "Study wrong answers" link below

**Both:**
- Question review section below with collapsible items
- Filter toggle for wrong answers only

---

## Animation Specification (Framer Motion)

All animations respect `prefers-reduced-motion: reduce` — when enabled, animations are disabled (instant transitions).

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Page navigation | Fade + slide up (y: 20 → 0, opacity: 0 → 1) | 200ms | ease-out |
| Question change | Card slide left/right (AnimatePresence, x: ±100) | 250ms | spring (stiffness 300, damping 30) |
| Answer selection | Scale tap (0.97) + ring glow fade-in | 150ms | ease-out |
| Wrong answer (study) | Shake horizontal (x: [-8, 8, -8, 8, 0]) | 300ms | ease-out |
| Correct answer (study) | Pulse scale (1.0 → 1.05 → 1.0) + green glow | 400ms | spring |
| Hint / AI reveal | Height expand (0 → auto) + fade-in | 300ms | spring (stiffness 200) |
| Score reveal | Count-up from 0 to score | 1500ms | ease-out |
| Pass confetti | Canvas confetti burst | 2000ms | — |
| Timer warning (<5min) | Color transition to amber + gentle pulse | 1000ms | ease-in-out, infinite |
| Timer critical (<1min) | Color to red + faster pulse + scale bounce | 500ms | ease-in-out, infinite |
| List items (home, results) | Staggered fade-in (y: 10 → 0, opacity) | 150ms each | 50ms stagger delay |
| Button hover | Scale 1.02, shadow lift | 150ms | ease-out |
| Skeleton loaders | Shimmer gradient sweep | 1500ms | linear, infinite |
| Dark mode toggle | Color crossfade on all themed elements | 200ms | ease-out (via CSS transition) |

### Animation Architecture

- Wrap `App.jsx` routes with `<AnimatePresence>` for page transitions
- Create `src/components/ui/PageTransition.jsx` — reusable motion wrapper for pages
- Create `src/components/ui/AnimatedCard.jsx` — card with entrance animation
- Create `src/components/ui/StaggerList.jsx` — staggered children animation
- Create `src/components/ui/CountUp.jsx` — animated number counter
- Create `src/hooks/useReducedMotion.js` — checks `prefers-reduced-motion` media query

---

## Tailwind Config Changes

```js
// tailwind.config.js additions
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        correct: 'var(--correct)',
        wrong: 'var(--wrong)',
        ai: 'var(--ai)',
        warning: 'var(--warning)',
        border: 'var(--border)',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif'],
        jp: ['Noto Sans JP', 'sans-serif'],
        mono: ['SF Mono', 'ui-monospace', 'monospace'], // system monospace only, no external font needed
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      letterSpacing: {
        tight: '-0.02em',
      },
    },
  },
}
```

---

## Files to Create

| File | Purpose |
|---|---|
| `src/components/ui/PageTransition.jsx` | Framer Motion page wrapper |
| `src/components/ui/AnimatedCard.jsx` | Card with entrance animation |
| `src/components/ui/StaggerList.jsx` | Staggered children list |
| `src/components/ui/CountUp.jsx` | Animated number counter |
| `src/components/ui/Skeleton.jsx` | Shimmer skeleton loader |
| `src/components/ui/ThemeToggle.jsx` | Dark/light mode toggle button |
| `src/hooks/useReducedMotion.js` | prefers-reduced-motion hook |
| `src/hooks/useTheme.js` | Dark mode state + localStorage + system preference |

## Files to Modify

Every existing page and component file will be modified for:
1. Updated Tailwind classes (new color tokens, rounded-xl, shadows)
2. Dark mode variants (`dark:bg-surface`, `dark:text-text-primary`, etc.)
3. Framer Motion wrappers where animations apply
4. New typography classes (font-sans, font-jp)

Key files:
- `tailwind.config.js` — custom theme
- `src/index.css` — CSS custom properties for light/dark
- `index.html` — Google Fonts link tags
- `src/App.jsx` — AnimatePresence wrapper
- `src/components/layout/Header.jsx` — logo, theme toggle, avatar
- `src/pages/Home.jsx` — category icons, test card redesign
- `src/pages/Login.jsx` — gradient bg, frosted card
- `src/pages/Exam.jsx` — timer pill, progress bar, question card
- `src/pages/Study.jsx` — hint card, AI card styling
- `src/pages/Results.jsx` — count-up, confetti, stat grid
- `src/components/exam/QuestionCard.jsx` — answer button redesign
- `src/components/exam/Timer.jsx` — pill design, pulse animations
- `src/components/exam/ProgressBar.jsx` — gradient bar
- `src/components/exam/ScoreCard.jsx` — count-up, stat grid
- `src/components/study/StudyCard.jsx` — feedback labels, hint card
- `src/components/study/AIExplanation.jsx` — purple gradient card
- `src/components/ui/Spinner.jsx` — replace with skeleton where appropriate

---

## Out of Scope

- No new pages or routes
- No changes to data flow, API calls, or Zustand stores
- No changes to Supabase schema or Edge Functions
- No changes to exam scoring logic
- No admin portal redesign (separate effort if needed), though the shared Header will be redesigned — admin pages should not break
- No i18n / English translation

## Implementation Notes

- Custom Tailwind color tokens (`primary`, `border`, `warning`) intentionally override Tailwind defaults. Use `border-border` for themed border color; standard Tailwind utilities like `border-red-500` still work fine.
- Use Noto Sans JP variable font URL from Google Fonts to ensure weight 500 (medium) is available for question text.
- Timer uses system monospace font stack — no external mono font needed.
