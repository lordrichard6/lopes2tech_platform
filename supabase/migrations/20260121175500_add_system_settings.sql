create table system_settings (
  id uuid primary key default gen_random_uuid(),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  updated_by uuid references auth.users(id),
  
  -- Invoice Defaults
  default_tax_rate numeric(5,2) default 8.1,
  default_currency text default 'CHF',
  default_payment_terms text default 'Net 30',
  default_footer_note text,
  
  -- Notification Preferences (Global defaults or system wide alerts)
  notify_new_client boolean default true,
  notify_payment boolean default true,
  notify_ticket boolean default true,

  -- System Flags
  maintenance_mode boolean default false,
  registration_open boolean default false
);

-- Enable RLS
alter table system_settings enable row level security;

-- Policies
create policy "Admins can view system settings" on system_settings
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can update system settings" on system_settings
  for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can insert system settings" on system_settings
  for insert with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Insert initial default row if it doesn't exist
insert into system_settings (default_tax_rate)
select 8.1
where not exists (select 1 from system_settings);
