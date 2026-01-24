import { createClient } from "@/lib/supabase/server";
import { sendQuoteAction, rejectRequestAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch Task
    const { data: task } = await supabase
        .from("tasks")
        .select("*, profiles!requester_id(full_name, email)")
        .eq("id", id)
        .single();

    if (!task) return notFound();

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="mb-6">
                <Link href="/admin/inbox" className="text-sm text-muted-foreground hover:underline">
                    ← Back to Inbox
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Request Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="text-sm font-medium block">Requester</span>
                            <div className="text-sm">{task.profiles?.full_name}</div>
                            <div className="text-xs text-muted-foreground">{task.profiles?.email}</div>
                        </div>
                        <div>
                            <span className="text-sm font-medium block">Title</span>
                            <div className="text-base">{task.title}</div>
                        </div>
                        <div>
                            <span className="text-sm font-medium block">Priority</span>
                            <Badge variant="outline" className="capitalize">{task.priority}</Badge>
                        </div>
                        <div>
                            <span className="text-sm font-medium block">Description</span>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Action</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={sendQuoteAction} className="space-y-4">
                            <input type="hidden" name="taskId" value={task.id} />
                            <div className="space-y-2">
                                <Label htmlFor="amount">Quote Amount</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                                    <div className="w-[80px]">
                                        <Input name="currency" defaultValue="CHF" />
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Send Quote</Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center border-t bg-muted/20 py-4">
                        <form action={rejectRequestAction}>
                            <input type="hidden" name="taskId" value={task.id} />
                            <Button type="submit" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                Reject Request
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
