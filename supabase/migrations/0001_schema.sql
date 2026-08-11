-- Full schema for the task/meeting management app. Paste into the Supabase
-- SQL editor (or `supabase db execute`) before 0002_rls_and_triggers.sql.
-- No ORM/migration tool involved — Supabase (auth + Postgres + storage) is
-- queried directly via @supabase/supabase-js.

create extension if not exists pgcrypto;

create type role as enum ('admin', 'manager', 'member');
create type priority as enum ('high', 'medium', 'low');
create type status as enum ('not_started', 'in_progress', 'on_hold', 'completed');
create type activity_action as enum (
  'created', 'status_change', 'priority_change', 'reassigned',
  'comment', 'attachment', 'follow_up', 'updated', 'archived'
);
create type follow_up_status as enum ('pending', 'completed');
create type meeting_status as enum ('scheduled', 'completed', 'cancelled');
create type notification_type as enum (
  'task_assigned', 'status_changed', 'comment_added', 'deadline_upcoming',
  'task_overdue', 'follow_up_due', 'meeting_reminder', 'meeting_invite'
);

-- Mirrors auth.users; id is a real FK since both live in the same database.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role role not null default 'member',
  department text,
  active boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table sectors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table topics (
  id uuid primary key default gen_random_uuid(),
  sector_id uuid not null references sectors (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  sector_id uuid references sectors (id) on delete set null,
  topic_id uuid references topics (id) on delete set null,
  title text not null,
  description text,
  priority priority not null default 'medium',
  status status not null default 'not_started',
  start_date date not null,
  deadline date,
  next_action text,
  next_follow_up_date date,
  remarks text,
  archived boolean not null default false,
  created_by uuid not null references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table task_assignees (
  task_id uuid not null references tasks (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  primary key (task_id, user_id)
);

create table task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks (id) on delete cascade,
  author_id uuid not null references profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);

create table task_activity (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks (id) on delete cascade,
  actor_id uuid not null references profiles (id),
  action activity_action not null,
  from_value text,
  to_value text,
  created_at timestamptz not null default now()
);

create table follow_ups (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks (id) on delete cascade,
  due_date date not null,
  status follow_up_status not null default 'pending',
  note text,
  completed_at timestamptz,
  completed_by uuid references profiles (id),
  created_by uuid not null references profiles (id),
  created_at timestamptz not null default now()
);

create table saved_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  filters jsonb not null,
  created_at timestamptz not null default now()
);

create table meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date date not null,
  start_time time not null,
  end_time time not null,
  location text,
  meeting_link text,
  organizer_id uuid not null references profiles (id),
  sector_id uuid references sectors (id) on delete set null,
  topic_id uuid references topics (id) on delete set null,
  agenda text,
  notes text,
  decisions text,
  status meeting_status not null default 'scheduled',
  recurrence jsonb,
  parent_meeting_id uuid references meetings (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table meeting_participants (
  meeting_id uuid not null references meetings (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  primary key (meeting_id, user_id)
);

create table meeting_action_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings (id) on delete cascade,
  description text not null,
  assignee_id uuid references profiles (id),
  converted_task_id uuid references tasks (id) on delete set null,
  created_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  filename text not null,
  size integer not null,
  mime_type text not null,
  uploaded_by uuid not null references profiles (id),
  task_id uuid references tasks (id) on delete cascade,
  meeting_id uuid references meetings (id) on delete cascade,
  task_comment_id uuid references task_comments (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index tasks_status_idx on tasks (status);
create index tasks_deadline_idx on tasks (deadline);
create index tasks_sector_idx on tasks (sector_id);
create index follow_ups_due_date_idx on follow_ups (due_date);
create index meetings_date_idx on meetings (date);
create index notifications_user_read_idx on notifications (user_id, read);
