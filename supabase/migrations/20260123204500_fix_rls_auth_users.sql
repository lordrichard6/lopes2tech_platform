-- Fix RLS policy to avoid querying auth.users directly (which triggers permission denied)
-- Drop the policy created in the previous step
DROP POLICY IF EXISTS "Clients can request payment review" ON invoice_payment_schedules;

-- Recreate it using auth.jwt() to look up email from the session token instead of the table
CREATE POLICY "Clients can request payment review" ON invoice_payment_schedules
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM clients c
            JOIN invoices i ON i.client_id = c.id
            WHERE i.id = invoice_payment_schedules.invoice_id
            AND (
                c.user_id = auth.uid() 
                OR 
                -- Use JWT claim for email instead of joining auth.users
                (c.contact_email IS NOT NULL AND lower(c.contact_email) = lower(auth.jwt() ->> 'email'))
            )
        )
    )
    WITH CHECK (
        status = 'processing'
    );
