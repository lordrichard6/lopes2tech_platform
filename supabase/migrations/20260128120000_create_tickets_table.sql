-- Create tickets table
create table tickets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  company text,
  phone text,
  message text not null,
  context text default 'General',
  status text default 'new' check (status in ('new', 'in_progress', 'resolved', 'closed')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high'))
);

-- Enable RLS
alter table tickets enable row level security;

-- Policies

-- admins can do everything
create policy "Admins can do everything on tickets"
  on tickets for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner', 'employee')
    )
  );

-- Service role (API) can insert
-- Note: When using supabase-js with the service_role key, it bypasses RLS automatically.
-- However, if we want to allow public inserts (e.g. from the website via client-side code directly), we would need:
-- create policy "Public can insert tickets" on tickets for insert with check (true);
-- BUT, we plan to use a Next.js API route that validates an API key, then inserts using existing admin/service connection.
-- So specialized public policies might not be strictly needed if the API route uses the service role client.

-- BUT, for safety, let's allow "anon" to insert if we ever decide to go direct, 
-- though our plan is strictly API-based proxy.
-- For now, we'll stick to Admin-only RLS + Service Role bypass.
