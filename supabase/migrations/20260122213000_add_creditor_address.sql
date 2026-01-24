-- Add creditor address fields to system_settings for Swiss QR bills
ALTER TABLE system_settings 
ADD COLUMN IF NOT EXISTS creditor_street TEXT,
ADD COLUMN IF NOT EXISTS creditor_zip TEXT,
ADD COLUMN IF NOT EXISTS creditor_city TEXT,
ADD COLUMN IF NOT EXISTS creditor_country TEXT DEFAULT 'CH';
