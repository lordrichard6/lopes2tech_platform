import { createClient } from "@/lib/supabase/server";
import { updateTaskStatusAction } from "./actions";
import { cancelTaskAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Verify Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    console.log(`[Debug] Fetching Task: ${id} for User: ${user.id}`);

    // Fetch Task (RLS protected - matches list page behavior)
    const { data: task, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error(`[Debug] Fetch Error: ${error.message}`);
    }

    if (!task) {
        console.error(`[Debug] Task Not Found or Access Denied`);
        return notFound();
    }

    console.log(`[Debug] Task Found: ${task.title}`);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="mb-6">
                <Link href="/tasks" className="text-sm text-muted-foreground hover:underline">
                    ← Back to Requests
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">{task.title}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="capitalize">{task.priority} Priority</Badge>
                                <span className="text-xs text-muted-foreground">Created on {new Date(task.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Badge variant={
                                task.status === 'requested' ? 'secondary' :
                                    task.status === 'quoted' ? 'default' :
                                        task.status === 'active' ? 'outline' : 'secondary'
                            } className="text-base px-3 py-1 capitalize">
                                {task.status}
                            </Badge>
                            {task.status === 'requested' && (
                                <form action={cancelTaskAction}>
                                    <input type="hidden" name="taskId" value={task.id} />
                                    <Button type="submit" variant="destructive" size="sm">
                                        Cancel Request
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
                    </div>

                    {task.quote_amount && (
                        <div className="bg-muted/50 p-4 rounded-lg border">
                            <h3 className="font-semibold mb-1">Quote Received</h3>
                            <div className="text-3xl font-bold flex items-baseline gap-1">
                                {task.quote_amount} <span className="text-lg font-normal text-muted-foreground">{task.quote_currency}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Review the quote above. Approving this request will mark it as active and we will begin work.
                            </p>
                        </div>
                    )}
                </CardContent>

                {task.status === 'quoted' && (
                    <CardFooter className="flex gap-4 justify-end border-t bg-muted/20 p-6">
                        <form action={updateTaskStatusAction}>
                            <input type="hidden" name="taskId" value={task.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <Button type="submit" variant="destructive">Decline</Button>
                        </form>
                        <form action={updateTaskStatusAction}>
                            <input type="hidden" name="taskId" value={task.id} />
                            <input type="hidden" name="status" value="active" />
                            <Button type="submit">Approve Quote</Button>
                        </form>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
