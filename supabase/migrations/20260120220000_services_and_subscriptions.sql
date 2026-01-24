-- Create services table
do $$ begin
    create type public.billing_type as enum ('one_time', 'monthly', 'yearly');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.subscription_status as enum ('active', 'cancelled', 'past_due');
exception
    when duplicate_object then null;
end $$;

create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price decimal(10, 2) not null default 0.00,
  billing_type public.billing_type not null default 'one_time',
  active boolean default true
);

-- Create subscriptions table (for recurring services linked to a client)
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete restrict not null,
  status public.subscription_status default 'active',
  start_date date default CURRENT_DATE,
  amount decimal(10, 2) not null -- Snapshot of the price at the time of subscription
);

-- Create project_services table (for one-time services linked to a project)
create table if not exists public.project_services (
  project_id uuid references public.projects(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete restrict not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (project_id, service_id)
);

-- Enable RLS
alter table public.services enable row level security;
alter table public.subscriptions enable row level security;
alter table public.project_services enable row level security;

-- Admin Policies (Full Access)
drop policy if exists "Admins have full access to services" on public.services;
create policy "Admins have full access to services" on public.services
  for all using (public.is_admin());

drop policy if exists "Admins have full access to subscriptions" on public.subscriptions;
create policy "Admins have full access to subscriptions" on public.subscriptions
  for all using (public.is_admin());

drop policy if exists "Admins have full access to project_services" on public.project_services;
create policy "Admins have full access to project_services" on public.project_services
  for all using (public.is_admin());

-- Client Policies (Read-Only)
drop policy if exists "Clients can view active services" on public.services;
create policy "Clients can view active services" on public.services
  for select using (active = true);

drop policy if exists "Clients can view own subscriptions" on public.subscriptions;
create policy "Clients can view own subscriptions" on public.subscriptions
  for select using (
    exists (
      select 1 from public.clients c
      where c.id = public.subscriptions.client_id
      and c.profile_id = auth.uid()
    )
  );

drop policy if exists "Clients can view own project services" on public.project_services;
create policy "Clients can view own project services" on public.project_services
  for select using (
    exists (
      select 1 from public.projects p
      join public.clients c on c.id = p.client_id
      where p.id = public.project_services.project_id
      and c.profile_id = auth.uid()
    )
  );
