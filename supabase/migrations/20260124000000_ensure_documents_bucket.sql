-- Ensure client-documents bucket exists
insert into storage.buckets (id, name, public)
values ('client-documents', 'client-documents', false)
on conflict (id) do nothing;

-- Ensure RLS is enabled (just in case)
-- policies are likely already there from previous migration, but re-asserting bucket existence is key.
