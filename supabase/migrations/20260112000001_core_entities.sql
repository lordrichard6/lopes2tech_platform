-- Create clients table
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  contact_email text,
  profile_id uuid references public.profiles(id) on delete set null -- Link to the user who represents this client
);

-- Create projects table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  name text not null,
  description text,
  status text default 'active' check (status in ('active', 'completed', 'on-hold')),
  progress integer default 0 check (progress >= 0 and progress <= 100)
);

-- Create milestones table
create table public.milestones (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'in-progress', 'completed')),
  due_date date
);

-- Helper function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Enable RLS
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.milestones enable row level security;

-- Admin Policies (Full Access)
create policy "Admins have full access to clients" on public.clients
  for all using (public.is_admin());

create policy "Admins have full access to projects" on public.projects
  for all using (public.is_admin());

create policy "Admins have full access to milestones" on public.milestones
  for all using (public.is_admin());

-- Client Policies (Read-Only own data)
create policy "Clients can view own client record" on public.clients
  for select using (auth.uid() = profile_id);

create policy "Clients can view own projects" on public.projects
  for select using (
    exists (
      select 1 from public.clients
      where clients.id = projects.client_id
      and clients.profile_id = auth.uid()
    )
  );

create policy "Clients can view own milestones" on public.milestones
  for select using (
    exists (
      select 1 from public.projects
      join public.clients on clients.id = projects.client_id
      where projects.id = milestones.project_id
      and clients.profile_id = auth.uid()
    )
  );
