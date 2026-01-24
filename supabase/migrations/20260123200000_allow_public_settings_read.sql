-- Allow all authenticated users to view system settings (needed for bank details on invoices)
create policy "Authenticated users can view system settings" on system_settings
  for select using (
    auth.role() = 'authenticated'
  );
