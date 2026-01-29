import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CreateRequestDialog } from "./create-request-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TaskDetailsDialog } from "./task-details-dialog";
import { cookies } from "next/headers";
import { dictionaries, Locale } from "@/lib/i18n/dictionaries";
import { unstable_noStore as noStore } from "next/cache";

export default async function RequestsPage() {
    noStore(); // Prevent caching to ensure deleted tasks don't appear
    const supabase = await createClient();
    const cookieStore = await cookies();
    const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'en') as Locale;
    const t = dictionaries[locale] || dictionaries.en;

    // RLS ensures users only see their own tasks
    const { data: tasks, error } = await supabase
        .from("tasks")
        .select("*")
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t.requests.title}</h1>
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
                                        {((t.requests.dialog as any)[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`] || task.priority)}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                    {task.description || t.requests.dialog.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                {task.quote_amount && (
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">{t.requests.quote}</div>
                                        <div className="font-bold">{task.quote_amount} {task.quote_currency}</div>
                                    </div>
                                )}
                                <Badge variant={
                                    task.status === 'requested' ? 'secondary' :
                                        task.status === 'quoted' ? 'default' :
                                            task.status === 'active' ? 'outline' : 'secondary'
                                }>
                                    {(t.requests.statusMap as any)[task.status] || task.status}
                                </Badge>
                                <TaskDetailsDialog task={task}>
                                    <Button variant="ghost" size="sm">
                                        {t.requests.view}
                                    </Button>
                                </TaskDetailsDialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {!tasks?.length && (
                    <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                        <p>{t.requests.noRequests}</p>
                        <Button variant="link" asChild>
                            <Link href="/requests/new">{t.requests.createFirst}</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
