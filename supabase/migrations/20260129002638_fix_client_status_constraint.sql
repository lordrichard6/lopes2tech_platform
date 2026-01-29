-- Fix client status constraint migration
-- This handles the case where the previous migration partially failed

-- Drop the constraint if it exists (in case it's the old or new one)
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_status_check;

-- Map any remaining old statuses to new ones
UPDATE public.clients SET status = 'proposal' WHERE status = 'pre-approval';
UPDATE public.clients SET status = 'client' WHERE status IN ('in-development', 'completed', 'maintenance');

-- Ensure all statuses are valid (set invalid ones to 'lead' as default)
UPDATE public.clients SET status = 'lead' 
WHERE status IS NULL 
   OR status NOT IN ('lead', 'qualified', 'proposal', 'client', 'vip', 'inactive', 'churned');

-- Add the new constraint
ALTER TABLE public.clients 
ADD CONSTRAINT clients_status_check 
CHECK (status IN ('lead', 'qualified', 'proposal', 'client', 'vip', 'inactive', 'churned'));

-- Add comments for documentation
COMMENT ON COLUMN public.clients.status IS 'Client relationship status: lead (new contact), qualified (interested), proposal (quote sent), client (paying), vip (high-value), inactive (paused), churned (lost)';
