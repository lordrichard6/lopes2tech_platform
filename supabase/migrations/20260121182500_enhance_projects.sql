-- Add new columns to projects table
alter table public.projects 
add column budget decimal(10,2),
add column start_date date default CURRENT_DATE,
add column deadline date;

-- Add comment
comment on column public.projects.budget is 'Estimated budget for the project';
comment on column public.projects.start_date is 'Project start date';
comment on column public.projects.deadline is 'Project deadline';
