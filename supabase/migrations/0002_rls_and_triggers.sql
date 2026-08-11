-- Run this AFTER 0001_schema.sql has created the tables.
-- Paste into the Supabase SQL editor (or `supabase db execute`).

-- ============================================================
-- 1. Auto-create a profile row whenever a user is created in
--    auth.users (e.g. after an admin invite is accepted).
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, department, active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::role, 'member'),
    new.raw_user_meta_data->>'department',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. Helper: current user's role, without recursive RLS lookups.
-- ============================================================
create or replace function public.current_role()
returns role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.current_role() = 'admin';
$$;

create or replace function public.is_manager_or_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.current_role() in ('admin', 'manager');
$$;

-- ============================================================
-- 3. Enable RLS on every business table.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.sectors enable row level security;
alter table public.topics enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_activity enable row level security;
alter table public.follow_ups enable row level security;
alter table public.saved_views enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_participants enable row level security;
alter table public.meeting_action_items enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;

-- ---- profiles ----
create policy "profiles: read all" on public.profiles
  for select to authenticated using (true);
create policy "profiles: update own or admin" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
-- inserts happen only via the handle_new_user trigger (security definer);
-- no direct insert policy for regular clients.
create policy "profiles: admin delete" on public.profiles
  for delete to authenticated using (public.is_admin());

-- ---- sectors / topics (admin/manager managed lookups) ----
create policy "sectors: read all" on public.sectors
  for select to authenticated using (true);
create policy "sectors: write manager+" on public.sectors
  for all to authenticated
  using (public.is_manager_or_admin())
  with check (public.is_manager_or_admin());

create policy "topics: read all" on public.topics
  for select to authenticated using (true);
create policy "topics: write manager+" on public.topics
  for all to authenticated
  using (public.is_manager_or_admin())
  with check (public.is_manager_or_admin());

-- ---- tasks ----
-- read: everyone (company-wide visibility, needed for dashboard/sector stats)
create policy "tasks: read all" on public.tasks
  for select to authenticated using (true);
-- insert: any authenticated user can create a task/activity
create policy "tasks: insert own" on public.tasks
  for insert to authenticated with check (created_by = auth.uid());
-- update/delete: creator, an assignee, or manager/admin
create policy "tasks: update owner/assignee/manager" on public.tasks
  for update to authenticated
  using (
    created_by = auth.uid()
    or public.is_manager_or_admin()
    or exists (
      select 1 from public.task_assignees ta
      where ta.task_id = id and ta.user_id = auth.uid()
    )
  )
  with check (
    created_by = auth.uid()
    or public.is_manager_or_admin()
    or exists (
      select 1 from public.task_assignees ta
      where ta.task_id = id and ta.user_id = auth.uid()
    )
  );
create policy "tasks: delete owner/manager" on public.tasks
  for delete to authenticated
  using (created_by = auth.uid() or public.is_manager_or_admin());

-- ---- task_assignees ----
create policy "task_assignees: read all" on public.task_assignees
  for select to authenticated using (true);
create policy "task_assignees: write owner/manager" on public.task_assignees
  for all to authenticated
  using (
    public.is_manager_or_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.created_by = auth.uid())
  )
  with check (
    public.is_manager_or_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.created_by = auth.uid())
  );

-- ---- task_comments ----
create policy "task_comments: read all" on public.task_comments
  for select to authenticated using (true);
create policy "task_comments: insert own" on public.task_comments
  for insert to authenticated with check (author_id = auth.uid());
create policy "task_comments: update/delete own or admin" on public.task_comments
  for all to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

-- ---- task_activity (system-authored audit trail; append-only) ----
create policy "task_activity: read all" on public.task_activity
  for select to authenticated using (true);
create policy "task_activity: insert any authenticated" on public.task_activity
  for insert to authenticated with check (actor_id = auth.uid());

-- ---- follow_ups ----
create policy "follow_ups: read all" on public.follow_ups
  for select to authenticated using (true);
create policy "follow_ups: insert own" on public.follow_ups
  for insert to authenticated with check (created_by = auth.uid());
create policy "follow_ups: update assignee/owner/manager" on public.follow_ups
  for update to authenticated
  using (
    created_by = auth.uid()
    or public.is_manager_or_admin()
    or exists (
      select 1 from public.task_assignees ta
      where ta.task_id = task_id and ta.user_id = auth.uid()
    )
  )
  with check (true);
create policy "follow_ups: delete owner/manager" on public.follow_ups
  for delete to authenticated
  using (created_by = auth.uid() or public.is_manager_or_admin());

-- ---- saved_views (private to the owner) ----
create policy "saved_views: owner only" on public.saved_views
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---- meetings ----
create policy "meetings: read all" on public.meetings
  for select to authenticated using (true);
create policy "meetings: insert own" on public.meetings
  for insert to authenticated with check (organizer_id = auth.uid());
create policy "meetings: update organizer/manager" on public.meetings
  for update to authenticated
  using (organizer_id = auth.uid() or public.is_manager_or_admin())
  with check (organizer_id = auth.uid() or public.is_manager_or_admin());
create policy "meetings: delete organizer/manager" on public.meetings
  for delete to authenticated
  using (organizer_id = auth.uid() or public.is_manager_or_admin());

-- ---- meeting_participants ----
create policy "meeting_participants: read all" on public.meeting_participants
  for select to authenticated using (true);
create policy "meeting_participants: write organizer/manager" on public.meeting_participants
  for all to authenticated
  using (
    public.is_manager_or_admin()
    or exists (select 1 from public.meetings m where m.id = meeting_id and m.organizer_id = auth.uid())
  )
  with check (
    public.is_manager_or_admin()
    or exists (select 1 from public.meetings m where m.id = meeting_id and m.organizer_id = auth.uid())
  );

-- ---- meeting_action_items ----
create policy "meeting_action_items: read all" on public.meeting_action_items
  for select to authenticated using (true);
create policy "meeting_action_items: write organizer/assignee/manager" on public.meeting_action_items
  for all to authenticated
  using (
    public.is_manager_or_admin()
    or assignee_id = auth.uid()
    or exists (select 1 from public.meetings m where m.id = meeting_id and m.organizer_id = auth.uid())
  )
  with check (
    public.is_manager_or_admin()
    or assignee_id = auth.uid()
    or exists (select 1 from public.meetings m where m.id = meeting_id and m.organizer_id = auth.uid())
  );

-- ---- documents ----
create policy "documents: read all" on public.documents
  for select to authenticated using (true);
create policy "documents: insert own" on public.documents
  for insert to authenticated with check (uploaded_by = auth.uid());
create policy "documents: delete own or admin" on public.documents
  for delete to authenticated using (uploaded_by = auth.uid() or public.is_admin());

-- ---- notifications (private to the owner) ----
create policy "notifications: owner only" on public.notifications
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- 4. Storage bucket for documents (private, policy-gated).
-- ============================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "documents bucket: read authenticated" on storage.objects
  for select to authenticated using (bucket_id = 'documents');
create policy "documents bucket: insert authenticated" on storage.objects
  for insert to authenticated with check (bucket_id = 'documents');
create policy "documents bucket: delete own or admin" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documents'
    and (owner = auth.uid() or public.is_admin())
  );

-- ============================================================
-- 5. Realtime: broadcast changes on notifications to their owner.
-- ============================================================
alter publication supabase_realtime add table public.notifications;
