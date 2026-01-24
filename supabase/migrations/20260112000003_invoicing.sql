-- Create invoice status enum
create type public.invoice_status as enum ('pending', 'paid', 'cancelled');

-- Create invoices table
create table public.invoices (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null, -- Optional link
  amount decimal(10, 2) not null,
  currency text default 'CHF',
  status public.invoice_status default 'pending',
  description text,
  due_date date,
  stripe_payment_intent_id text,
  stripe_payment_status text
);

-- Enable RLS
alter table public.invoices enable row level security;

-- Admin Policies (Full Access)
create policy "Admins have full access to invoices" on public.invoices
  for all using (public.is_admin());

-- Client Policies
-- 1. View own invoices (via client_id linkage)
-- Low-level: Client User -> Profile -> Linked Client ID -> Invoices
-- But currently our `clients` table doesn't strictly link to `auth.users` directly in a 1:1 enforced way 
-- except via our manual logic.
-- Ideally we need a way to check "Is this auth.uid() allowed to see this client_id"?
-- For MVP Sprint 4, we will assume:
-- A profile can be associated with a client. 
-- Let's add a function or just rely on 'clients' table having a 'user_id' if we added it?
-- Checking schema: `clients` has `contact_email`. 
-- Let's stick to: Admin creates invoice. Client sees it.
-- We need to ensure a secure way for a logged-in user to see their company's invoices.
-- Option A: Add `user_id` to `clients`.
-- Option B: Check if `auth.jwt() -> email` matches `clients.contact_email`.

-- Proceeding with Option B (Email match) for simplicity in this MVP, 
-- or better: we update `clients` to have `user_id` if we want really secure RLS using UUIDs.
-- Let's assume we'll filter by RLS using email matching for now or 
-- actually, let's keep it simple: Access controls in the Application Layer (Page) using `server.ts` logic 
-- to check if the user is the owner, and RLS set to "Admins only" + "Users who match some criteria".
-- 
-- REVISION: Detailed Plan check.
-- "Client Features: List of invoices".
-- I will add `user_id` to `clients` table in this migration to make RLS cleaner.

alter table public.clients add column user_id uuid references auth.users(id);

create policy "Clients can view own invoices" on public.invoices
  for select using (
    exists (
      select 1 from public.clients c
      where c.id = public.invoices.client_id
      and c.user_id = auth.uid()
    )
  );
