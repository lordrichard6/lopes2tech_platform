import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "../status-badge";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Mail, Calendar, FileText, Layers, FolderKanban, Plus } from "lucide-react";
import { UploadDocument } from "./upload-document";
import { DocumentRow } from "./document-row";
import { SubscriptionsCard } from "./subscriptions-card";
import { LiquidProjectCard } from "./liquid-project-card";
import { CredentialsCard } from "./credentials-card";
import { NotesCard } from "./notes-card";
import { PortalAccessCard } from "./portal-access-card";
import { CreateProjectDialog } from "./create-project-dialog";
import { CreateOfferDialog } from "./create-offer-dialog";
import { CreateContractDialog } from "./create-contract-dialog";
import { CreateWelcomeDialog } from "./create-welcome-dialog";
import { CreateHandoverDialog } from "./create-handover-dialog";
import { CreateSupportDialog } from "./create-support-dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch Client Details
    const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

    if (clientError || !client) {
        notFound();
    }

    // Fetch Projects with Task Counts
    const { data: projects } = await supabase
        .from("projects")
        .select("*, tasks(id, status), milestones(id, status)")
        .eq("client_id", id)
        .order("created_at", { ascending: false });

    // Calculate progress for each project in memory (since Supabase count aggregates can be tricky in one query without RPC)
    const projectsWithProgress = projects?.map(project => {
        const totalTasks = project.tasks?.length || 0;
        const completedTasks = project.tasks?.filter((t: any) => t.status === 'completed').length || 0;
        const totalMilestones = project.milestones?.length || 0;
        const completedMilestones = project.milestones?.filter((m: any) => m.status === 'completed').length || 0;

        return {
            ...project,
            task_count: totalTasks,
            completed_task_count: completedTasks,
            milestone_count: totalMilestones,
            completed_milestone_count: completedMilestones
        }
    });

    // Fetch Invoices
    const { data: invoices } = await supabase
        .from("invoices")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: false });

    // Fetch Documents
    const { data: documents } = await supabase
        .from("documents")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: false });

    // Fetch Active Subscriptions
    const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("*, services(*)")
        .eq("client_id", id)
        .order("start_date", { ascending: false });

    // Fetch Stripe subscription statuses for subscriptions linked to Stripe
    const stripeSubscriptionIds = subscriptions
        ?.filter(sub => sub.stripe_subscription_id)
        .map(sub => sub.stripe_subscription_id) || [];

    const { getStripeSubscriptionStatuses } = await import('./stripe-subscription-status');
    const stripeStatuses = stripeSubscriptionIds.length > 0
        ? await getStripeSubscriptionStatuses(stripeSubscriptionIds)
        : {};

    // Fetch subscription payment invoices
    // Get ALL paid invoices for this client (we'll filter by description in the component)
    const { data: allClientInvoices } = await supabase
        .from("invoices")
        .select("id, amount, currency, created_at, stripe_payment_intent_id, description, status")
        .eq("client_id", id)
        .order("created_at", { ascending: false });

    // Filter for subscription-related invoices
    const subscriptionInvoices = allClientInvoices?.filter(inv => 
        inv.status === 'paid' && (
            inv.description?.includes('Subscription Renewal:') || 
            inv.stripe_payment_intent_id !== null
        )
    ) || [];

    // Fetch Available Services (for dropdown)
    const { data: availableServices } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("name", { ascending: true });

    // Fetch Credentials
    const { data: credentials } = await supabase
        .from("credentials")
        .select("id, service_name, url, username, notes") // Don't fetch encrypted_password/iv here, only on reveal
        .eq("client_id", id)
        .order("created_at", { ascending: false });

    // Fetch Notes
    const { data: notes } = await supabase
        .from("notes")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/clients">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>

                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border bg-background shadow-sm">
                            <AvatarImage src={client.avatar_url ? (client.avatar_url.startsWith('http') ? client.avatar_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${client.avatar_url}`) : undefined} className="object-cover" />
                            <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                                {client.name?.substring(0, 2).toUpperCase() || 'CL'}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
                                <StatusBadge status={client.status || 'lead'} />
                            </div>
                            <p className="text-muted-foreground">{client.contact_email}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Edit Client</Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="credentials">Credentials</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Client Info Sidebar */}
                        <div className="md:col-span-1 space-y-6">
                            <PortalAccessCard
                                clientId={id}
                                clientName={client.name}
                                clientEmail={client.contact_email}
                                profileId={client.profile_id}
                            />

                            <Card className="h-fit">
                                <CardHeader>
                                    <CardTitle>Contact Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{client.contact_email || "No email"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>Joined {format(new Date(client.created_at), "PPP")}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content Areas */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Subscriptions Section */}
                            <SubscriptionsCard
                                clientId={id}
                                clientName={client.name}
                                clientEmail={client.contact_email}
                                subscriptions={subscriptions || []}
                                availableServices={availableServices || []}
                                stripeStatuses={stripeStatuses}
                                subscriptionInvoices={subscriptionInvoices || []}
                            />

                            {/* Projects Section */}
                            {/* Projects Section */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Projects</CardTitle>
                                    <CreateProjectDialog clientId={id} availableServices={availableServices || []} />
                                </CardHeader>
                                <CardContent>
                                    {projectsWithProgress && projectsWithProgress.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {projectsWithProgress.map((project) => (
                                                <LiquidProjectCard key={project.id} project={project} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="border border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground">
                                            No projects found.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Invoices Section */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Invoices</CardTitle>
                                    <Button size="sm" asChild>
                                        <Link href="/admin/invoices/new">
                                            <Plus className="mr-2 h-4 w-4" /> Add Invoice
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {invoices && invoices.length > 0 ? (
                                        <div className="space-y-4">
                                            {invoices.map((invoice) => (
                                                <div key={invoice.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                                    <div>
                                                        <div className="font-medium">{invoice.currency} {invoice.amount}</div>
                                                        <div className="text-xs text-muted-foreground">{format(new Date(invoice.created_at), "PP")}</div>
                                                    </div>
                                                    <Badge variant={invoice.status === 'paid' ? 'outline' : 'destructive'}>
                                                        {invoice.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No invoices found.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-6">
                    <NotesCard
                        clientId={id}
                        notes={notes || []}
                    />
                </TabsContent>

                <TabsContent value="documents" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-medium">Documents</h2>
                            <p className="text-sm text-muted-foreground">Manage contracts, proposals, and invoices for this client.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <CreateOfferDialog
                                clientId={id}
                                clientName={client.name}
                                clientEmail={client.contact_email}
                                clientCompany={client.company_name}
                                iconOnly
                            />
                            <CreateContractDialog
                                clientId={id}
                                clientName={client.name}
                                clientEmail={client.contact_email}
                                clientCompany={client.company_name}
                                iconOnly
                            />
                            <CreateWelcomeDialog
                                clientId={id}
                                clientName={client.name}
                                clientEmail={client.contact_email}
                                clientCompany={client.company_name}
                                iconOnly
                            />
                            <CreateHandoverDialog
                                clientId={id}
                                clientName={client.name}
                                clientEmail={client.contact_email}
                                clientCompany={client.company_name}
                                iconOnly
                            />
                            <CreateSupportDialog
                                clientId={id}
                                clientName={client.name}
                                clientEmail={client.contact_email}
                                clientCompany={client.company_name}
                                iconOnly
                            />
                            <UploadDocument clientId={id} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {documents && documents.length > 0 ? (
                            documents.map((doc) => (
                                <DocumentRow key={doc.id} doc={doc} clientEmail={client.contact_email} />
                            ))
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="p-3 bg-secondary/20 rounded-full mb-3">
                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium">No documents yet</h3>
                                    <p className="text-muted-foreground mb-4 max-w-sm">
                                        Upload documents like contracts, offers, or invoices to share them with the client.
                                    </p>
                                    <UploadDocument clientId={id} />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="credentials" className="space-y-6">
                    <CredentialsCard
                        clientId={id}
                        credentials={credentials || []}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
