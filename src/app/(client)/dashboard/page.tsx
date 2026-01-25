import { ClientDashboardView } from "@/components/dashboard/client-dashboard-view";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch client info
    const { data: client } = await supabase
        .from("clients")
        .select("id, name")
        .eq("profile_id", user?.id)
        .single();

    // Fetch projects
    const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(3);

    // Fetch documents
    const { data: documents } = await supabase
        .from("documents")
        .select("*")
        .eq("is_visible_to_client", true)
        .order('created_at', { ascending: false })
        .limit(5);

    // Fetch invoices
    const { data: invoices } = await supabase
        .from("invoices")
        .select("*")
        .order('created_at', { ascending: false });

    // Calculate stats
    const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
    const totalProjects = projects?.length || 0;
    const pendingInvoices = invoices?.filter(i => ['pending', 'partial', 'overdue'].includes(i.status)) || [];
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const documentCount = documents?.length || 0;

    // Get greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <ClientDashboardView
            clientName={client?.name || 'User'}
            projects={projects || []}
            documents={documents || []}
            invoices={invoices || []}
            activeProjectsCount={activeProjects}
            totalProjectsCount={totalProjects}
            pendingInvoicesCount={pendingInvoices.length}
            pendingAmount={pendingAmount}
            documentCount={documentCount}
        />
    );
}
