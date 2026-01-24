-- Add comprehensive settings fields to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS secondary_email TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Zurich',
ADD COLUMN IF NOT EXISTS billing_street_address TEXT,
ADD COLUMN IF NOT EXISTS billing_city TEXT,
ADD COLUMN IF NOT EXISTS billing_postal_code TEXT,
ADD COLUMN IF NOT EXISTS billing_country TEXT,
ADD COLUMN IF NOT EXISTS notify_project_updates BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_invoice_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_new_documents BOOLEAN DEFAULT true;

-- Add theme preference to profiles table (applies to all users)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system'));

-- Comments
COMMENT ON COLUMN public.clients.timezone IS 'IANA timezone identifier, e.g. Europe/Zurich';
COMMENT ON COLUMN public.clients.notify_project_updates IS 'Receive emails when project milestones change';
COMMENT ON COLUMN public.clients.notify_invoice_reminders IS 'Receive payment due reminders';
COMMENT ON COLUMN public.clients.notify_new_documents IS 'Receive emails when new documents are shared';
