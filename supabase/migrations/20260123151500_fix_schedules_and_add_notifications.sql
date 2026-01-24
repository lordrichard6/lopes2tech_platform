-- Migration: Fix Payment Schedule RLS and Add Notification Columns

-- 1. Fix RLS for payment schedules (Allow admins to manage ALL schedules without checking referenced tables)
DROP POLICY IF EXISTS "Admins can manage payment schedules" ON invoice_payment_schedules;

CREATE POLICY "Admins can manage payment schedules" ON invoice_payment_schedules
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 2. Add notification tracking columns
ALTER TABLE invoice_payment_schedules
ADD COLUMN IF NOT EXISTS upcoming_reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_overdue_reminder_sent_at TIMESTAMPTZ;
