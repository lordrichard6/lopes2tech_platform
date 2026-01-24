import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FolderKanban, FileText, Receipt, Clock, ArrowRight, Download } from "lucide-react";

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
    const pendingInvoices = invoices?.filter(i => i.status === 'pending') || [];
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const documentCount = documents?.length || 0;

    // Get greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {greeting}, {client?.name?.split(' ')[0] || 'there'}! 👋
                </h1>
                <p className="text-muted-foreground">
                    Here's an overview of your projects and account.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeProjects}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalProjects} total projects
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {pendingInvoices.length > 0 ? `CHF ${pendingAmount.toFixed(0)}` : 'All paid'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {pendingInvoices.length} invoice{pendingInvoices.length !== 1 ? 's' : ''} pending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Shared Documents</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{documentCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Available files
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Projects Section */}
                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Projects</CardTitle>
                            <CardDescription>Your latest project updates</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/projects" className="gap-1">
                                View all <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {projects?.length ? (
                            <div className="space-y-4">
                                {projects.map((project) => (
                                    <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                        <div className="space-y-1">
                                            <p className="font-medium">{project.name}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                                    {project.status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">{project.progress}% complete</span>
                                            </div>
                                        </div>
                                        <div className="w-20">
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${project.progress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <FolderKanban className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No projects yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Documents Section */}
                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Documents</CardTitle>
                            <CardDescription>Shared files and documents</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/documents" className="gap-1">
                                View all <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {documents?.length ? (
                            <div className="space-y-2">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium text-sm">{doc.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(doc.size / 1024).toFixed(0)} KB • {new Date(doc.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No documents shared yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/documents">View Documents</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/settings">Edit Profile</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="mailto:support@lopes2tech.ch">Contact Support</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
