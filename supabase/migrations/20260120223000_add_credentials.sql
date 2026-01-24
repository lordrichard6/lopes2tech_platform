-- Create credentials table
create table if not exists public.credentials (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  service_name text not null,
  url text,
  username text,
  encrypted_password text not null,
  iv text not null, -- Initialization Vector for AES
  notes text
);

-- Enable RLS
alter table public.credentials enable row level security;

-- Admin Policies (Full Access)
drop policy if exists "Admins have full access to credentials" on public.credentials;
create policy "Admins have full access to credentials" on public.credentials
  for all using (public.is_admin());

-- Client Policies (No Access by default, or read-only if we decide later)
-- For now, credentials are an internal admin/agency tool. 
-- Clients typically know their own passwords, but if we manage them, we hold them.
-- We can add client access later if requested.
