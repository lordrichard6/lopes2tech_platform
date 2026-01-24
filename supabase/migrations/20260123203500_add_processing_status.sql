-- Update status check constraint to include 'processing'
ALTER TABLE invoice_payment_schedules
DROP CONSTRAINT IF EXISTS invoice_payment_schedules_status_check;

ALTER TABLE invoice_payment_schedules
ADD CONSTRAINT invoice_payment_schedules_status_check
CHECK (status IN ('pending', 'paid', 'overdue', 'processing'));

-- Allow clients to mark schedules as processing (request review)
CREATE POLICY "Clients can request payment review" ON invoice_payment_schedules
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM clients c
            JOIN invoices i ON i.client_id = c.id
            WHERE i.id = invoice_payment_schedules.invoice_id
            AND (c.user_id = auth.uid() OR c.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        )
    )
    WITH CHECK (
        status = 'processing'
    );
