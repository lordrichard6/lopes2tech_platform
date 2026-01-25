import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProjectDashboard from "./project-dashboard";

export default async function ClientProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch project details
    const { data: project, error } = await supabase
        .from("projects")
        .select(`
            *,
            clients(name),
            milestones:milestones(*),
            invoices:invoices(*),
            links:project_links(*)
        `)
        .eq("id", id)
        .single();

    if (!project) return notFound();

    return (
        <ProjectDashboard
            project={project}
            milestones={project.milestones}
            invoices={project.invoices}
            links={project.links || []}
        />
    );
}
