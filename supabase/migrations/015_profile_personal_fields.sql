-- 015_profile_personal_fields.sql
--
-- Adds personal-info fields to profiles so users can manage their own
-- identity separately from org-scoped membership data:
--   - date_of_birth: optional, user-supplied
--   - gender: free-form short text (allows "female", "male", "non-binary",
--     "prefer not to say", etc.) — not enumerated so we don't keep
--     migrating as the list evolves
--
-- avatar_url is already on profiles from an earlier migration. This pass
-- also creates the `avatars` storage bucket and RLS policies so users can
-- upload their own profile picture.

alter table public.profiles
  add column if not exists date_of_birth date,
  add column if not exists gender text;

-- Storage bucket for user avatars. Public-read so <img> tags work without
-- signed URLs; uploads and updates still require auth (see policies below).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

-- Drop prior iterations defensively so re-running the migration is safe.
drop policy if exists "avatars_public_read" on storage.objects;
drop policy if exists "avatars_owner_insert" on storage.objects;
drop policy if exists "avatars_owner_update" on storage.objects;
drop policy if exists "avatars_owner_delete" on storage.objects;

-- Public read — avatars are meant to be embedded in the UI for anyone who
-- can see the team member.
create policy "avatars_public_read"
on storage.objects for select
using (bucket_id = 'avatars');

-- Users can upload into their own folder. Paths follow `<user_id>/<file>`
-- so the RLS check is a cheap prefix match against auth.uid().
create policy "avatars_owner_insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_owner_update"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_owner_delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
