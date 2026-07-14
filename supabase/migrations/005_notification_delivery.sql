alter table public.notifications
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists message_key text,
  add column if not exists message_params jsonb not null default '{}'::jsonb,
  add column if not exists action_url text,
  add column if not exists dedupe_key text,
  add column if not exists sent_at timestamptz not null default now();

create unique index if not exists notifications_dedupe_key_idx
  on public.notifications(dedupe_key)
  where dedupe_key is not null;

drop policy if exists "Admins can create notifications" on public.notifications;

create policy "Admins can read notification delivery"
  on public.notifications for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Users can mark own notifications read"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
