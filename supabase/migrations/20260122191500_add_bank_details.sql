-- Add bank details to system_settings
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS bank_address text;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS iban text;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS bic text;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS account_holder text;

-- Add Swiss QR specific fields
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS qr_iban text; -- Separate IBAN for QR bills if different
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS qr_reference_type text DEFAULT 'QRR'; -- QRR or SCOR
