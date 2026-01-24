-- Create task status enum
create type public.task_status as enum ('requested', 'quoted', 'approved', 'active', 'completed', 'rejected');

-- Create tasks table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  requester_id uuid references public.profiles(id) on delete cascade not null, -- The user who requested it
  project_id uuid references public.projects(id) on delete set null, -- Optional link to a project (if approved/active)
  title text not null,
  description text,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  status public.task_status default 'requested',
  quote_amount decimal(10, 2), -- Populated by Admin
  quote_currency text default 'CHF'
);

-- Enable RLS
alter table public.tasks enable row level security;

-- Admin Policies (Full Access)
create policy "Admins have full access to tasks" on public.tasks
  for all using (public.is_admin());

-- Client Policies
-- 1. View own tasks
create policy "Clients can view own tasks" on public.tasks
  for select using (auth.uid() = requester_id);

-- 2. Create new tasks (Request)
create policy "Clients can create tasks" on public.tasks
  for insert with check (auth.uid() = requester_id);

-- 3. Update own tasks (Only for Approval/Rejection actions)
-- We might restrict which columns they can update in the application layer, 
-- but RLS here ensures they own the task.
create policy "Clients can update own tasks" on public.tasks
  for update using (auth.uid() = requester_id);
