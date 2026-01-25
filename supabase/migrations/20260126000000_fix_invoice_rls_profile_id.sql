
-- Fix RLS policies to use the correct 'profile_id' column
-- This ensures Clients can see invoices linked to their Profile ID.

-- 1. Update Invoices Policy
drop policy if exists "Clients can view own invoices" on public.invoices;

create policy "Clients can view own invoices" on public.invoices
  for select using (
    exists (
      select 1 from public.clients c
      where c.id = public.invoices.client_id
      and (
        c.profile_id = auth.uid() 
        OR 
        lower(c.contact_email) = lower(auth.jwt() ->> 'email')
      )
    )
  );

-- 2. Update Clients Policy (Clients need to see their own profile too)
drop policy if exists "Clients can view own profile" on public.clients;

create policy "Clients can view own profile" on public.clients
  for select using (
    profile_id = auth.uid() 
    OR 
    lower(contact_email) = lower(auth.jwt() ->> 'email')
  );

-- 3. Ensure 'Paulo Lopes' client is linked to the correct profile if missing
-- (Optional cleanup for local dev)
do $$
begin
  update public.clients
  set profile_id = (select id from auth.users where email = 'paulo@lopes2tech.ch')
  where contact_email = 'paulo@lopes2tech.ch';
end $$;
