-- ============================================================
-- 003_multilingual_content_columns.sql
-- Add optional English/Myanmar content columns used by the app.
-- Japanese remains the source-of-truth fallback for existing data.
-- ============================================================

alter table public.categories
  add column if not exists name_my text;

alter table public.tests
  add column if not exists title_en text,
  add column if not exists title_my text;

alter table public.questions
  add column if not exists question_en text,
  add column if not exists question_my text,
  add column if not exists hint_en text,
  add column if not exists hint_my text,
  add column if not exists scenario_context_jp text,
  add column if not exists scenario_context_en text,
  add column if not exists scenario_context_my text;

alter table public.sub_questions
  add column if not exists text_en text,
  add column if not exists text_my text;
