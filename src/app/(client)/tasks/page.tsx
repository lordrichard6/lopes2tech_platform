import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CreateRequestDialog } from "./create-request-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TaskDetailsDialog } from "./task-details-dialog";

export default async function TasksPage() {
    const supabase = await createClient();

    // RLS ensures users only see their own tasks
    const { data: tasks, error } = await supabase
        .from("tasks")
        .select("*")
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Access Requests</h1>
                <CreateRequestDialog />
            </div>

            <div className="grid gap-4">
                {tasks?.map((task) => (
                    <Card key={task.id} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="font-semibold text-lg flex items-center gap-2">
                                    {task.title}
                                    <Badge variant="outline" className="text-xs font-normal capitalize">
                                        {task.priority}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                    {task.description || "No description provided."}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                {task.quote_amount && (
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Quote</div>
                                        <div className="font-bold">{task.quote_amount} {task.quote_currency}</div>
                                    </div>
                                )}
                                <Badge variant={
                                    task.status === 'requested' ? 'secondary' :
                                        task.status === 'quoted' ? 'default' :
                                            task.status === 'active' ? 'outline' : 'secondary'
                                }>
                                    {task.status}
                                </Badge>
                                <TaskDetailsDialog task={task}>
                                    <Button variant="ghost" size="sm">
                                        View
                                    </Button>
                                </TaskDetailsDialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {!tasks?.length && (
                    <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                        <p>No requests found.</p>
                        <Button variant="link" asChild>
                            <Link href="/tasks/new">Create your first request</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
