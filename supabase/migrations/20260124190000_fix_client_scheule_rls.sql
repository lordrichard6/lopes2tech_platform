-- Give clients access to their own payment schedules

-- 1. Allow SELECT
DROP POLICY IF EXISTS "Clients can view own payment schedules" ON invoice_payment_schedules;

CREATE POLICY "Clients can view own payment schedules" ON invoice_payment_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM invoices i
            JOIN clients c ON i.client_id = c.id
            WHERE i.id = invoice_payment_schedules.invoice_id
            AND (
                c.user_id = auth.uid() 
                OR 
                lower(c.contact_email) = lower(auth.jwt() ->> 'email')
            )
        )
    );

-- 2. Allow UPDATE (e.g. marking as paid/processing)
DROP POLICY IF EXISTS "Clients can update own payment schedules" ON invoice_payment_schedules;

CREATE POLICY "Clients can update own payment schedules" ON invoice_payment_schedules
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM invoices i
            JOIN clients c ON i.client_id = c.id
            WHERE i.id = invoice_payment_schedules.invoice_id
            AND (
                c.user_id = auth.uid() 
                OR 
                lower(c.contact_email) = lower(auth.jwt() ->> 'email')
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices i
            JOIN clients c ON i.client_id = c.id
            WHERE i.id = invoice_payment_schedules.invoice_id
            AND (
                c.user_id = auth.uid() 
                OR 
                lower(c.contact_email) = lower(auth.jwt() ->> 'email')
            )
        )
    );
