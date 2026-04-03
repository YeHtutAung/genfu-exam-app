-- ============================================================
-- 001_initial_schema.sql
-- Genfu Exam App — initial database schema
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- profiles: extends Supabase auth.users with role + email cache
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  role        text not null default 'user' check (role in ('admin', 'user')),
  created_at  timestamptz not null default now()
);

-- categories: licence types (genfu, futsu_bike, daigata_bike, futsu_car)
create table public.categories (
  id       uuid primary key default gen_random_uuid(),
  code     text not null unique,
  name_jp  text not null,
  name_en  text not null,
  active   boolean not null default true
);

-- tests: a single practice test set belonging to a category
create table public.tests (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references public.categories (id) on delete restrict,
  test_number   integer not null,
  title_jp      text,
  time_limit    integer not null default 1800,  -- seconds
  pass_score    integer not null default 45,
  total_points  integer not null default 50,
  active        boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (category_id, test_number)
);

-- questions: one row per question; answer is null for scenario type
create table public.questions (
  id               uuid primary key default gen_random_uuid(),
  test_id          uuid not null references public.tests (id) on delete cascade,
  question_number  integer not null,
  type             text not null check (type in ('standard', 'scenario')),
  question_jp      text not null,
  answer           boolean,          -- null for scenario (answered via sub_questions)
  hint_jp          text,
  points           integer not null default 1,
  image_render     text check (image_render in ('css', 'static')),
  sign_code        text,             -- used when image_render = 'css'
  image_url        text,             -- Supabase Storage URL, set on confirm-upload
  image_alt        text,
  unique (test_id, question_number)
);

-- sub_questions: the three sub-items under a scenario question
create table public.sub_questions (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references public.questions (id) on delete cascade,
  sub_number   integer not null,
  text_jp      text not null,
  answer       boolean not null,
  unique (question_id, sub_number)
);

-- exam_sessions: one row per exam or study attempt by a user
create table public.exam_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  test_id       uuid not null references public.tests (id) on delete restrict,
  mode          text not null check (mode in ('exam', 'study')),
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  score         integer,
  passed        boolean
);

-- answers: one row per answered question (or sub-question) per session
create table public.answers (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references public.exam_sessions (id) on delete cascade,
  question_id      uuid not null references public.questions (id) on delete cascade,
  sub_question_id  uuid references public.sub_questions (id) on delete cascade,  -- null for standard
  user_answer      boolean,
  is_correct       boolean
);

-- ============================================================
-- INDEXES
-- ============================================================

create index on public.tests (category_id);
create index on public.questions (test_id);
create index on public.sub_questions (question_id);
create index on public.exam_sessions (user_id);
create index on public.exam_sessions (test_id);
create index on public.answers (session_id);
create index on public.answers (question_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles      enable row level security;
alter table public.categories    enable row level security;
alter table public.tests         enable row level security;
alter table public.questions     enable row level security;
alter table public.sub_questions enable row level security;
alter table public.exam_sessions enable row level security;
alter table public.answers       enable row level security;

-- ── Helper: is the calling user an admin? ────────────────────
-- Defined as a security-definer function so it can read profiles
-- without triggering RLS recursion.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ──────────────────────────────────────────────────────────────
-- profiles
-- ──────────────────────────────────────────────────────────────

-- Users can read their own profile; admins can read all
create policy "profiles: user read own"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Users can update their own profile (email); admins can update any
create policy "profiles: user update own"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

-- Insert handled by the on-signup trigger below; no direct client inserts
create policy "profiles: admin insert"
  on public.profiles for insert
  with check (public.is_admin());

-- Only admins may delete profiles
create policy "profiles: admin delete"
  on public.profiles for delete
  using (public.is_admin());

-- ──────────────────────────────────────────────────────────────
-- categories
-- ──────────────────────────────────────────────────────────────

-- All authenticated users can read active categories
create policy "categories: authenticated read"
  on public.categories for select
  using (auth.role() = 'authenticated');

-- Only admins can write
create policy "categories: admin insert"
  on public.categories for insert
  with check (public.is_admin());

create policy "categories: admin update"
  on public.categories for update
  using (public.is_admin());

create policy "categories: admin delete"
  on public.categories for delete
  using (public.is_admin());

-- ──────────────────────────────────────────────────────────────
-- tests
-- ──────────────────────────────────────────────────────────────

-- Authenticated users can read active tests; admins see all
create policy "tests: user read active"
  on public.tests for select
  using (
    (active = true and auth.role() = 'authenticated')
    or public.is_admin()
  );

create policy "tests: admin insert"
  on public.tests for insert
  with check (public.is_admin());

create policy "tests: admin update"
  on public.tests for update
  using (public.is_admin());

create policy "tests: admin delete"
  on public.tests for delete
  using (public.is_admin());

-- ──────────────────────────────────────────────────────────────
-- questions
-- ──────────────────────────────────────────────────────────────

-- Authenticated users can read questions for active tests; admins see all
create policy "questions: user read active tests"
  on public.questions for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.tests
      where tests.id = questions.test_id and tests.active = true
    )
  );

create policy "questions: admin insert"
  on public.questions for insert
  with check (public.is_admin());

create policy "questions: admin update"
  on public.questions for update
  using (public.is_admin());

create policy "questions: admin delete"
  on public.questions for delete
  using (public.is_admin());

-- ──────────────────────────────────────────────────────────────
-- sub_questions
-- ──────────────────────────────────────────────────────────────

create policy "sub_questions: user read active tests"
  on public.sub_questions for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.questions q
      join public.tests t on t.id = q.test_id
      where q.id = sub_questions.question_id and t.active = true
    )
  );

create policy "sub_questions: admin insert"
  on public.sub_questions for insert
  with check (public.is_admin());

create policy "sub_questions: admin update"
  on public.sub_questions for update
  using (public.is_admin());

create policy "sub_questions: admin delete"
  on public.sub_questions for delete
  using (public.is_admin());

-- ──────────────────────────────────────────────────────────────
-- exam_sessions
-- ──────────────────────────────────────────────────────────────

-- Users see only their own sessions; admins see all
create policy "exam_sessions: user read own"
  on public.exam_sessions for select
  using (auth.uid() = user_id or public.is_admin());

create policy "exam_sessions: user insert own"
  on public.exam_sessions for insert
  with check (auth.uid() = user_id);

create policy "exam_sessions: user update own"
  on public.exam_sessions for update
  using (auth.uid() = user_id);

-- No deletes on sessions (preserve history)

-- ──────────────────────────────────────────────────────────────
-- answers
-- ──────────────────────────────────────────────────────────────

-- Users see answers for their own sessions; admins see all
create policy "answers: user read own"
  on public.answers for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.exam_sessions s
      where s.id = answers.session_id and s.user_id = auth.uid()
    )
  );

create policy "answers: user insert own session"
  on public.answers for insert
  with check (
    exists (
      select 1 from public.exam_sessions s
      where s.id = answers.session_id and s.user_id = auth.uid()
    )
  );

-- Answers are immutable once written — no update/delete policies

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGN-UP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- SEED DATA — categories
-- ============================================================

insert into public.categories (code, name_jp, name_en) values
  ('genfu',       '原付',       'Moped'),
  ('futsu_bike',  '普通二輪',   'Standard Motorcycle'),
  ('daigata_bike','大型二輪',   'Large Motorcycle'),
  ('futsu_car',   '普通自動車', 'Standard Car');
