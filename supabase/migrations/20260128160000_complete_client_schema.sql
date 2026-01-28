-- Complete client schema with all fields needed for invoicing and QR bills
-- Current fields: id, created_at, name, contact_email, profile_id, status, company_name, phone,
--                 street_address, city, postal_code, country, vat_id, preferred_language

-- Add billing-specific address fields (for cases where billing address differs from main address)
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS billing_address TEXT,
ADD COLUMN IF NOT EXISTS billing_city TEXT,
ADD COLUMN IF NOT EXISTS billing_zip TEXT,
ADD COLUMN IF NOT EXISTS billing_country TEXT;

-- Add additional useful fields
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at (drop first if exists to avoid errors)
DROP TRIGGER IF EXISTS clients_updated_at_trigger ON public.clients;
CREATE TRIGGER clients_updated_at_trigger
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_clients_updated_at();

-- Fix country default to be 2-char ISO code for QR bill compatibility
-- Note: existing 'Switzerland' values will need manual update or handled in app code
COMMENT ON COLUMN public.clients.country IS 'ISO 3166-1 alpha-2 country code (e.g., CH, DE, AT). Default fallback to CH in app code.';
COMMENT ON COLUMN public.clients.billing_country IS 'ISO 3166-1 alpha-2 country code for billing address';

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_clients_contact_email ON public.clients (contact_email);
CREATE INDEX IF NOT EXISTS idx_clients_stripe_customer_id ON public.clients (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients (status);
