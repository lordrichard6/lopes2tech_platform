-- Add additional profile fields to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Switzerland',
ADD COLUMN IF NOT EXISTS vat_id TEXT,
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'de', 'pt', 'fr'));

-- Add comment for documentation
COMMENT ON COLUMN public.clients.preferred_language IS 'Preferred language for email communication: en, de, pt, fr';
COMMENT ON COLUMN public.clients.vat_id IS 'VAT/Tax ID for B2B invoicing';
