-- Forced first-login password change applies to manager/member accounts
-- only; admins are never auto-flagged (and can't be reset via the team
-- page's "reset password" action either — see lib/actions/team.ts).
alter table profiles alter column must_change_password set default false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, department, active, must_change_password)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::role, 'member'),
    new.raw_user_meta_data->>'department',
    true,
    coalesce((new.raw_user_meta_data->>'role')::role, 'member') <> 'admin'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
