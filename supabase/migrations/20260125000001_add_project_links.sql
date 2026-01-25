create table if not exists project_links (
    id uuid not null default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    name text not null,
    url text not null,
    description text,
    icon text not null,
    created_at timestamptz not null default now(),
    primary key (id)
);

-- Enable RLS
alter table project_links enable row level security;

-- Policies
create policy "Admins can manage project links"
    on project_links
    for all
    using ( exists (select 1 from profiles where id = auth.uid() and role = 'admin') );

create policy "Clients can view their project links"
    on project_links
    for select
    using (
        exists (
            select 1 from projects
            where projects.id = project_links.project_id
            and projects.client_id = auth.uid()
        )
    );
