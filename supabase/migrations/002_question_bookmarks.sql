-- ============================================================
-- 002_question_bookmarks.sql
-- User-owned question bookmarks
-- ============================================================

create table public.question_bookmarks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  question_id  uuid not null references public.questions (id) on delete cascade,
  note         text,
  created_at   timestamptz not null default now(),
  unique (user_id, question_id)
);

create index on public.question_bookmarks (user_id);
create index on public.question_bookmarks (question_id);

alter table public.question_bookmarks enable row level security;

create policy "question_bookmarks: user read own"
  on public.question_bookmarks for select
  using (auth.uid() = user_id);

create policy "question_bookmarks: user insert own"
  on public.question_bookmarks for insert
  with check (auth.uid() = user_id);

create policy "question_bookmarks: user update own"
  on public.question_bookmarks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "question_bookmarks: user delete own"
  on public.question_bookmarks for delete
  using (auth.uid() = user_id);
