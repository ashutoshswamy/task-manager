-- CRITICAL: "profiles: update own or admin" (0002) lets a non-admin update
-- every column of their own row, including `role` and `active`. RLS is
-- row-scoped, not column-scoped, so a user can hit PostgREST directly
-- (bypassing the app's team.ts checks entirely) with e.g.
--   PATCH /rest/v1/profiles?id=eq.<own-id>   { "role": "admin" }
-- and self-promote. Lock non-admin self-updates to the columns the app
-- actually exposes to users (full_name, avatar_url, must_change_password);
-- role/active/email/department stay admin-only, enforced server-side via a
-- trigger since RLS itself can't express column-level rules.
create or replace function public.guard_profile_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role
    or new.active is distinct from old.active
    or new.email is distinct from old.email
    or new.department is distinct from old.department
  then
    raise exception 'Only an admin can change role, active status, email, or department';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_self_update on public.profiles;
create trigger guard_profile_self_update
  before update on public.profiles
  for each row execute function public.guard_profile_self_update();
