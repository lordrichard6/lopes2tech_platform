import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle2, Rocket, Trash2 } from "lucide-react";
import { deleteTaskAction } from "./[id]/actions";
import { CreateProjectFromTaskDialog } from "./create-project-from-task-dialog";

export default async function AdminInboxPage() {
    const supabase = createAdminClient();

    // Fetch requested tasks (needs admin action)
    const { data: requestedTasks } = await supabase
        .from("tasks")
        .select(`
            *,
            profiles!requester_id (
                full_name,
                clients (
                    name
                )
            )
        `)
        .eq("status", "requested")
        .order('created_at', { ascending: false });

    // Fetch quoted tasks (waiting for client approval)
    const { data: quotedTasks } = await supabase
        .from("tasks")
        .select(`
            *,
            profiles!requester_id (
                full_name,
                clients (
                    name
                )
            )
        `)
        .eq("status", "quoted")
        .order('created_at', { ascending: false });

    // Fetch approved/active tasks (client approved, ready for project creation)
    const { data: approvedTasks } = await supabase
        .from("tasks")
        .select(`
            *,
            profiles!requester_id (
                full_name,
                clients (
                    name,
                    id
                )
            )
        `)
        .eq("status", "active")
        .is("project_id", null) // Only show tasks without a project yet
        .order('created_at', { ascending: false });

    // Fetch available services for project creation dialog
    const { data: availableServices } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("name", { ascending: true });

    // Helper function to format date as day/month/year
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const renderTaskCard = (task: any, showQuote: boolean = false, showActions: boolean = false) => {
        const profile = task.profiles as any;
        const clientName = profile?.clients?.[0]?.name;
        const displayName = profile?.full_name || clientName || 'Unknown User';

        return (
            <Card key={task.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                        <div className="font-semibold text-lg flex items-center gap-2">
                            {displayName}
                            <Badge variant="outline" className="text-xs font-normal capitalize">
                                {task.priority}
                            </Badge>
                            {(showQuote || showActions) && task.quote_amount && (
                                <Badge variant="secondary" className="text-xs font-semibold">
                                    {task.quote_currency} {task.quote_amount.toFixed(2)}
                                </Badge>
                            )}
                        </div>
                        <div className="font-medium">{task.title}</div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                        </p>
                        {showQuote && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Quote sent {formatDate(task.created_at)}
                            </p>
                        )}
                        {showActions && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Approved {formatDate(task.created_at)}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground mr-2">
                            {formatDate(task.created_at)}
                        </span>
                        {showActions ? (
                            <div className="flex items-center gap-2">
                                {profile?.clients?.[0]?.id && availableServices && (
                                    <CreateProjectFromTaskDialog
                                        task={{
                                            id: task.id,
                                            title: task.title,
                                            description: task.description,
                                            quote_amount: task.quote_amount,
                                            quote_currency: task.quote_currency,
                                        }}
                                        clientId={profile.clients[0].id}
                                        availableServices={availableServices}
                                    />
                                )}
                                <form action={deleteTaskAction}>
                                    <input type="hidden" name="taskId" value={task.id} />
                                    <Button size="sm" variant="destructive" type="submit">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <Button size="sm" asChild>
                                <Link href={`/admin/inbox/${task.id}`}>
                                    {showQuote ? 'View' : 'Review'}
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
            </div>

            <Tabs defaultValue="pending-review" className="w-full">
                <TabsList>
                    <TabsTrigger value="pending-review" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Pending Review
                        {requestedTasks && requestedTasks.length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {requestedTasks.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="pending-approval" className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Pending Approval
                        {quotedTasks && quotedTasks.length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {quotedTasks.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="flex items-center gap-2">
                        <Rocket className="h-4 w-4" />
                        Approved
                        {approvedTasks && approvedTasks.length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {approvedTasks.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending-review" className="space-y-4 mt-6">
                    <div className="grid gap-4">
                        {requestedTasks?.map((task) => renderTaskCard(task, false))}
                        {!requestedTasks?.length && (
                            <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                                <p>No pending requests.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="pending-approval" className="space-y-4 mt-6">
                    <div className="grid gap-4">
                        {quotedTasks?.map((task) => renderTaskCard(task, true))}
                        {!quotedTasks?.length && (
                            <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                                <p>No quotes pending client approval.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="approved" className="space-y-4 mt-6">
                    <div className="grid gap-4">
                        {approvedTasks?.map((task) => renderTaskCard(task, false, true))}
                        {!approvedTasks?.length && (
                            <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                                <p>No approved requests waiting for project creation.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
