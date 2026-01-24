-- Add status column to clients
ALTER TABLE public.clients 
ADD COLUMN status text DEFAULT 'lead' 
CHECK (status IN ('lead', 'pre-approval', 'in-development', 'completed', 'maintenance', 'inactive', 'churned'));

-- Update existing clients based on assumed status (can be manually adjusted later)
UPDATE public.clients SET status = 'lead' WHERE name = 'Hugo Sousa'; -- Example logic
UPDATE public.clients SET status = 'maintenance' WHERE name = 'Ribeiro Consulting'; -- Known paying client
UPDATE public.clients SET status = 'in-development' WHERE name = 'Beauty Hair Twins'; -- Known in progress
UPDATE public.clients SET status = 'in-development' WHERE name = 'Rita & Jéssica Soares'; -- Known in progress
