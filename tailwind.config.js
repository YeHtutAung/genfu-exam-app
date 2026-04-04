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
