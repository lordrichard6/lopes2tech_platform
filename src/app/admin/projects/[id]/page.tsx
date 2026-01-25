import { createClient } from "@/lib/supabase/server";
import { EditProjectDialog } from "./edit-project-dialog";
import { DeleteProjectButton } from "./delete-project-button";
import { MilestoneCard } from "./milestone-card";
import { AddMilestoneDialog } from "./add-milestone-dialog";
import { CreateInvoiceDialog } from "./create-invoice-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Wallet, Activity, Briefcase, Hash, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { AddLinkDialog } from "./add-link-dialog";
import { ProjectLinksList } from "./project-links-list";

interface ProjectService {
    service_id: string;
    services: {
        name: string;
        price: number;
        billing_type: string;
    };
}

interface ProjectTask {
    id: string;
    status: string;
}

interface ProjectInvoice {
    id: string;
    description: string;
    created_at: string;
    status: string;
    currency: string;
    amount: number;
}

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch Project with Client and Services (Force Rebuild)
    const { data: project } = await supabase
        .from("projects")
        .select(`
      *,
      clients ( name ),
      project_services (
        service_id,
        services ( * )
      ),
      tasks ( id, status ),
      invoices ( * )
    `)
        .eq("id", id)
        .single();

    if (!project) return notFound();

    // Calculations
    const totalServicesCost = project.project_services?.reduce((sum: number, ps: ProjectService) => sum + (Number(ps.services?.price) || 0), 0) || 0;
    const totalTasks = project.tasks?.length || 0;
    const completedTasks = project.tasks?.filter((t: ProjectTask) => t.status === 'completed').length || 0;
    const budgetUtilization = project.budget ? Math.round((totalServicesCost / project.budget) * 100) : 0;

    // Fetch Milestones
    const { data: milestones } = await supabase
        .from("milestones")
        .select(`
            *,
            services ( name )
        `)
        .eq("project_id", id)
        .order("due_date", { ascending: true });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/projects" className="text-sm text-muted-foreground hover:underline">
                        ← Back to Projects
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <EditProjectDialog project={project} />
                    <DeleteProjectButton projectId={project.id} projectName={project.name} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    {/* Project Info */}
                    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                            {project.name}
                                        </CardTitle>
                                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="capitalize px-3 py-1">
                                            {project.status}
                                        </Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-2 text-base">
                                        <Briefcase className="w-4 h-4" />
                                        {project.clients?.name}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Progress Section */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                        <Activity className="w-4 h-4" /> Progress
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            ({completedTasks}/{totalTasks} tasks)
                                        </span>
                                        <span className="text-blue-600 dark:text-blue-400">{project.progress}%</span>
                                    </div>
                                </div>
                                <Progress value={project.progress} className="h-2.5 bg-slate-100 dark:bg-slate-800" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                {project.budget !== null ? (
                                    <div className="space-y-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Wallet className="w-3.5 h-3.5" /> Financials
                                        </p>
                                        <div>
                                            <p className="text-lg font-semibold tracking-tight">CHF {project.budget.toLocaleString()}</p>
                                            <p className="text-[10px] text-muted-foreground">Budget</p>
                                        </div>
                                        <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
                                            <Progress value={budgetUtilization} className="h-1.5" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Wallet className="w-3.5 h-3.5" /> Total Value
                                        </p>
                                        <p className="text-lg font-semibold tracking-tight">CHF {totalServicesCost.toLocaleString()}</p>
                                        <p className="text-[10px] text-muted-foreground">Committed Services</p>
                                    </div>
                                )}

                                {(project.start_date || project.deadline) && (
                                    <div className="space-y-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <CalendarDays className="w-3.5 h-3.5" /> Timeline
                                        </p>
                                        <div className="text-sm font-medium leading-none mt-1.5">
                                            {project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'No deadline'}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            {project.start_date ? `Started ${format(new Date(project.start_date), 'MMM d')}` : 'Not started'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {project.description && (
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50">
                                    <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>


                </div>

                <div className="space-y-6">
                    {/* Services Card */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Hash className="w-4 h-4 text-muted-foreground" /> Services
                            </CardTitle>
                            <Badge variant="outline" className="ml-auto font-mono">
                                Total: CHF {totalServicesCost.toLocaleString()}
                            </Badge>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {project.project_services && project.project_services.length > 0 ? (
                                project.project_services.map((ps: ProjectService) => (
                                    <div key={ps.service_id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                        <div className="space-y-0.5">
                                            <div className="font-medium text-sm">{ps.services?.name}</div>
                                            <div className="text-xs text-muted-foreground capitalize flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                                {ps.services?.billing_type?.replace('_', ' ')}
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                            CHF {ps.services?.price}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground italic px-2">No services linked.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Important Links */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-muted-foreground" /> Important Links
                            </CardTitle>
                            <AddLinkDialog projectId={project.id} />
                        </CardHeader>
                        <CardContent>
                            <ProjectLinksList projectId={project.id} />
                        </CardContent>
                    </Card>

                    {/* Invoices Card */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-muted-foreground" /> Invoices
                            </CardTitle>
                            <CreateInvoiceDialog project={project} />
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {project.invoices && project.invoices.length > 0 ? (
                                    project.invoices.map((inv: ProjectInvoice) => (
                                        <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                            <div className="space-y-0.5">
                                                <div className="font-medium text-sm">
                                                    {inv.description || "Invoice"}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <span>{format(new Date(inv.created_at), 'MMM d, yyyy')}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                                                    {inv.status}
                                                </Badge>
                                                <div className="text-sm font-semibold min-w-[80px] text-right">
                                                    {inv.currency} {inv.amount}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic px-2">No invoices created.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>


            <Separator />

            {/* Milestones List */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Milestones</h2>
                    <AddMilestoneDialog projectId={id} services={project.project_services || []} />
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {milestones?.map((milestone) => (
                        <MilestoneCard
                            key={milestone.id}
                            milestone={milestone}
                            projectId={id}
                            services={project.project_services || []}
                        />
                    ))}
                    {!milestones?.length && <p className="text-muted-foreground text-sm col-span-2">No milestones yet.</p>}
                </div>
            </div>
        </div >
    );
}
