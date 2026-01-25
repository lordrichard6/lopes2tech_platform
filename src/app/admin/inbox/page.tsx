import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function AdminInboxPage() {
    const supabase = createAdminClient();

    // Fetch requested tasks
    const { data: tasks } = await supabase
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
            </div>

            <div className="grid gap-4">
                {tasks?.map((task) => {
                    const profile = task.profiles as any;
                    const clientName = profile?.clients?.[0]?.name;
                    const displayName = profile?.full_name || clientName || 'Unknown User';

                    return (
                        <Card key={task.id} className="hover:bg-muted/50 transition-colors">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="font-semibold text-lg flex items-center gap-2">
                                        {displayName}
                                        <span className="text-muted-foreground font-normal">requested</span>
                                        <Badge variant="outline" className="text-xs font-normal capitalize">
                                            {task.priority}
                                        </Badge>
                                    </div>
                                    <div className="font-medium">{task.title}</div>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {task.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-muted-foreground mr-2">
                                        {new Date(task.created_at).toLocaleDateString()}
                                    </span>
                                    <Button size="sm" asChild>
                                        <Link href={`/admin/inbox/${task.id}`}>Review</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
                {!tasks?.length && (
                    <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                        <p>No pending requests.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
