-- Fix RLS policies to allow clients to view data based on Email match
-- This is a fallback/improvement for when user_id is not yet linked.

-- 1. Update Invoices Policy
drop policy if exists "Clients can view own invoices" on public.invoices;

create policy "Clients can view own invoices" on public.invoices
  for select using (
    exists (
      select 1 from public.clients c
      where c.id = public.invoices.client_id
      and (
        c.user_id = auth.uid() 
        OR 
        lower(c.contact_email) = lower(auth.jwt() ->> 'email')
      )
    )
  );

-- 2. Update Clients Policy (Clients need to see their own profile too)
drop policy if exists "Clients can view own profile" on public.clients;

create policy "Clients can view own profile" on public.clients
  for select using (
    user_id = auth.uid() 
    OR 
    lower(contact_email) = lower(auth.jwt() ->> 'email')
  );

-- 3. Auto-link user_id on login/select if possible? 
-- Ideally we should have a trigger to link them, but simpler is to just allow the access.
-- Let's add a trigger to auth.users to auto-link clients on signup just in case.

create or replace function public.handle_new_user_client_link()
returns trigger as $$
begin
  update public.clients
  set user_id = new.id
  where lower(contact_email) = lower(new.email)
  and user_id is null;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on user creation (if not exists)
drop trigger if exists on_auth_user_created_link_client on auth.users;
create trigger on_auth_user_created_link_client
  after insert on auth.users
  for each row execute procedure public.handle_new_user_client_link();

-- Also run a one-time update for existing users
do $$
begin
  update public.clients c
  set user_id = u.id
  from auth.users u
  where lower(c.contact_email) = lower(u.email)
  and c.user_id is null;
end $$;
