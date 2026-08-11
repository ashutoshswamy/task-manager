-- Admin sets a member's initial/reset password directly (no invite email).
-- This flag forces a password change on next login via proxy.ts.
alter table profiles
  add column must_change_password boolean not null default true;
