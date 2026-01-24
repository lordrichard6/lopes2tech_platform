-- Add project_id to documents table
alter table public.documents
add column if not exists project_id uuid references public.projects(id) on delete set null;

-- Enable RLS for INSERT on documents table for Clients
-- Clients can insert documents linked to their own client_id
create policy "Clients can insert own documents" on public.documents
  for insert with check (
    exists (
      select 1 from public.clients c
      where c.id = public.documents.client_id
      and c.profile_id = auth.uid()
    )
  );

-- Enable RLS for INSERT on storage (client-documents) for Clients
-- Clients can upload files to client-documents bucket
-- Path convention: client_id/filename
create policy "Clients can upload to client-documents bucket"
on storage.objects for insert with check (
  bucket_id = 'client-documents'
  and exists (
    select 1 from public.clients c
    where cast(c.id as text) = (storage.foldername(name))[1]
    and c.profile_id = auth.uid()
  )
);
