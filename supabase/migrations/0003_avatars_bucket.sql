-- Public bucket for profile pictures. Paste into the Supabase SQL editor
-- after 0001_schema.sql and 0002_rls_and_triggers.sql have been applied.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars bucket: public read" on storage.objects
  for select to public using (bucket_id = 'avatars');

create policy "avatars bucket: own folder insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars bucket: own folder update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars bucket: own folder delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
