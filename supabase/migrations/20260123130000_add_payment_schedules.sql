-- Migration: Add Payment Schedule System
-- Creates table for invoice payment schedules (installments) and adds payment plan fields to invoices

-- Add payment plan fields to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS payment_plan_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS installments_count INT DEFAULT 1;

-- Create payment schedules table
CREATE TABLE IF NOT EXISTS invoice_payment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    qr_reference TEXT UNIQUE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(invoice_id, installment_number)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_schedules_invoice 
ON invoice_payment_schedules(invoice_id);

CREATE INDEX IF NOT EXISTS idx_payment_schedules_qr_reference 
ON invoice_payment_schedules(qr_reference);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_payment_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_payment_schedule_updated_at ON invoice_payment_schedules;
CREATE TRIGGER trigger_payment_schedule_updated_at
    BEFORE UPDATE ON invoice_payment_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_schedule_updated_at();

-- Enable RLS
ALTER TABLE invoice_payment_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can do everything
CREATE POLICY "Admins can manage payment schedules" ON invoice_payment_schedules
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM clients c
            JOIN invoices i ON i.client_id = c.id
            WHERE i.id = invoice_payment_schedules.invoice_id
        )
    );

-- RLS Policy: Clients can view their own schedules
CREATE POLICY "Clients can view own schedules" ON invoice_payment_schedules
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM clients c
            JOIN invoices i ON i.client_id = c.id
            WHERE i.id = invoice_payment_schedules.invoice_id
            AND (c.user_id = auth.uid() OR c.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        )
    );
