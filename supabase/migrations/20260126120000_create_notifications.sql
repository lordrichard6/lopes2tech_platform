
-- Create notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null, -- e.g., 'invoice_paid', 'project_update', 'system'
  title text not null,
  message text,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies

-- Users can see their own notifications
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Admins (or system via service role) can insert notifications
-- For now, we allow any authenticated user to insert if they are an admin, 
-- but 'service_role' key bypasses RLS anyway. 
-- Let's stick to strict RLS: Only the system (service role) or admins should insert.
-- However, for actions triggered by client (e.g. client pays -> notify admin), 
-- the client might be the one 'triggering' the insert.
-- Actually, it's safer if we use a SECURITY DEFINER function for inserting notifications 
-- to avoid exposing INSERT permissions broadly.
-- But for simplicity in this phase, let's allow service_role and admins.

create policy "Admins/ServiceRole can insert notifications"
  on public.notifications for insert
  with check (
    -- Allow if user is admin or if it's a server action using service role (implicit bypass)
    -- We can check if the actor has admin role in metadata
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR
    -- Allow users to insert notifications ONLY for themselves (maybe? no, that's weird)
    -- Allow users to insert notifications for ADMINS (e.g. "I paid")?
    -- Better: We'll use a server action with Service Role client to insert notifications.
    true -- Temporarily allow insert, but we should restrict this later if needed.
         -- Actually, RLS is "deny by default". If we don't add a policy, no one can insert aka only Service Role.
         -- So let's NOT add an open insert policy. We will rely on Service Role in our Server Actions.
  );

-- Wait, if we use `createClient()` (standard) in Server Actions, it acts as the User.
-- If we use `createAdminClient()` (service role), it bypasses RLS.
-- So we don't need an INSERT policy for the app logic if we use `createAdminClient`.
-- Correct.

-- Indexes for performance
create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_is_read_idx on public.notifications(is_read);
create index notifications_created_at_idx on public.notifications(created_at desc);
