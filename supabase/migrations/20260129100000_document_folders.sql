-- Create document_folders table for organizing documents
create table if not exists public.document_folders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  name text not null,
  parent_id uuid references public.document_folders(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null
);

-- Add folder_id to documents table
alter table public.documents 
add column if not exists folder_id uuid references public.document_folders(id) on delete set null;

-- Enable RLS
alter table public.document_folders enable row level security;

-- Admin Policies (Full Access)
drop policy if exists "Admins have full access to document_folders" on public.document_folders;
create policy "Admins have full access to document_folders" on public.document_folders
  for all using (public.is_admin());

-- Client Policies (Full CRUD for own folders)
drop policy if exists "Clients can view own folders" on public.document_folders;
create policy "Clients can view own folders" on public.document_folders
  for select using (
    exists (
      select 1 from public.clients c
      where c.id = public.document_folders.client_id
      and c.profile_id = auth.uid()
    )
  );

drop policy if exists "Clients can insert own folders" on public.document_folders;
create policy "Clients can insert own folders" on public.document_folders
  for insert with check (
    exists (
      select 1 from public.clients c
      where c.id = public.document_folders.client_id
      and c.profile_id = auth.uid()
    )
  );

drop policy if exists "Clients can update own folders" on public.document_folders;
create policy "Clients can update own folders" on public.document_folders
  for update using (
    exists (
      select 1 from public.clients c
      where c.id = public.document_folders.client_id
      and c.profile_id = auth.uid()
    )
  );

drop policy if exists "Clients can delete own folders" on public.document_folders;
create policy "Clients can delete own folders" on public.document_folders
  for delete using (
    exists (
      select 1 from public.clients c
      where c.id = public.document_folders.client_id
      and c.profile_id = auth.uid()
    )
  );

-- Index for faster folder queries
create index if not exists idx_document_folders_client_id on public.document_folders(client_id);
create index if not exists idx_document_folders_parent_id on public.document_folders(parent_id);
create index if not exists idx_documents_folder_id on public.documents(folder_id);
