-- Update client status to sales funnel approach (Option B)
-- Old: lead, pre-approval, in-development, completed, maintenance, inactive, churned
-- New: lead, qualified, proposal, client, vip, inactive, churned

-- First, map existing statuses to new ones
UPDATE public.clients SET status = 'proposal' WHERE status = 'pre-approval';
UPDATE public.clients SET status = 'client' WHERE status IN ('in-development', 'completed', 'maintenance');
-- 'lead', 'inactive', 'churned' remain the same

-- Drop the old constraint and add new one
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE public.clients 
ADD CONSTRAINT clients_status_check 
CHECK (status IN ('lead', 'qualified', 'proposal', 'client', 'vip', 'inactive', 'churned'));

-- Add comments for documentation
COMMENT ON COLUMN public.clients.status IS 'Client relationship status: lead (new contact), qualified (interested), proposal (quote sent), client (paying), vip (high-value), inactive (paused), churned (lost)';
