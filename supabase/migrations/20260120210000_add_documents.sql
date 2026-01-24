-- Create documents table
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  name text not null,
  file_path text not null,
  size integer not null,
  type text not null,
  is_visible_to_client boolean default false
);

-- Enable RLS
alter table public.documents enable row level security;

-- Admin Policies (Full Access)
drop policy if exists "Admins have full access to documents" on public.documents;
create policy "Admins have full access to documents" on public.documents
  for all using (public.is_admin());

-- Client Policies (Read-Only if visible)
drop policy if exists "Clients can view own visible documents" on public.documents;
create policy "Clients can view own visible documents" on public.documents
  for select using (
    exists (
      select 1 from public.clients c
      where c.id = public.documents.client_id
      and c.profile_id = auth.uid()
    )
    and is_visible_to_client = true
  );

-- Storage Bucket Setup (via SQL for local dev)
insert into storage.buckets (id, name, public)
values ('client-documents', 'client-documents', false)
on conflict (id) do nothing;

-- Storage Policies
drop policy if exists "Admins have full access to client-documents bucket" on storage.objects;
create policy "Admins have full access to client-documents bucket"
on storage.objects for all using (
  bucket_id = 'client-documents'
  and public.is_admin()
);

drop policy if exists "Clients can view own visible files" on storage.objects;
create policy "Clients can view own visible files"
on storage.objects for select using (
  bucket_id = 'client-documents'
  and exists (
    select 1 from public.documents d
    join public.clients c on c.id = d.client_id
    where d.file_path = storage.objects.name
    and c.profile_id = auth.uid()
    and d.is_visible_to_client = true
  )
);
