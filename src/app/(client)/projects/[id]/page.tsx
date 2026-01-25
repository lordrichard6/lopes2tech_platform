import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProjectDashboard from "./project-dashboard";

export default async function ClientProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch Project (RLS protected)
    const { data: project } = await supabase
        .from("projects")
        .select("*, clients(name)")
        .eq("id", id)
        .single();

    if (!project) return notFound();

    // Fetch Milestones
    const { data: milestones } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", id)
        .order("due_date", { ascending: true });

    // Fetch Invoices (for budget calc)
    // RLS will ensure we only see invoices for this user/client
    const { data: invoices } = await supabase
        .from("invoices")
        .select("amount, amount_paid, status")
        .eq("project_id", id);

    return (
        <ProjectDashboard
            project={project}
            milestones={milestones || []}
            invoices={invoices || []}
        />
    );
}
