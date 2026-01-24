-- TEMPORARY DEBUG POLICY
-- Allow everyone to read schedules to rule out RLS issues

CREATE POLICY "Debug: Allow All Select" ON invoice_payment_schedules
FOR SELECT
USING (true);
