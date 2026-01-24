-- Create avatars bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage Policies for Avatars

-- 1. Everyone can view avatars (public)
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 2. Authenticated users can upload their own avatar
drop policy if exists "Users can upload their own avatar." on storage.objects;
create policy "Users can upload their own avatar."
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
  );

-- 3. Users can update their own avatar
drop policy if exists "Users can update their own avatar." on storage.objects;
create policy "Users can update their own avatar."
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() = owner
  );
