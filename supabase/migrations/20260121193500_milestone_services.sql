-- Add service_id to milestones table
alter table public.milestones 
add column service_id uuid references public.services(id) on delete set null;

-- Add comment
comment on column public.milestones.service_id is 'Optional link to a service within the project';

-- Enable RLS for this column (implicitly covered by table policy, but good to note)
