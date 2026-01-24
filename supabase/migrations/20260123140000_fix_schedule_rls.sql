-- Fix RLS policies for invoice_payment_schedules
-- The previous policy was incorrect and caused 403 errors for admins

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage payment schedules" ON invoice_payment_schedules;
DROP POLICY IF EXISTS "Clients can view own schedules" ON invoice_payment_schedules;

-- Create correct Admin policy (checks for 'admin' role in profiles)
CREATE POLICY "Admins can manage payment schedules" ON invoice_payment_schedules
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create correct Client policy (checks ownership via invoice -> client)
CREATE POLICY "Clients can view own schedules" ON invoice_payment_schedules
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM invoices i
            JOIN clients c ON i.client_id = c.id
            WHERE i.id = invoice_payment_schedules.invoice_id
            AND (
                -- Client is the user
                c.user_id = auth.uid() 
                OR 
                -- Client email matches user email
                lower(c.contact_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
            )
        )
    );
