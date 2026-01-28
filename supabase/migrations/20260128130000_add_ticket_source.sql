-- Add source column to tickets
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'platform';

-- Add comment
COMMENT ON COLUMN public.tickets.source IS 'Source of the ticket (e.g., contact form, email, manual)';
