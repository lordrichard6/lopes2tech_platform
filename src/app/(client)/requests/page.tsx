import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { RequestsCreateWithFab } from "./create-request-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TaskDetailsDialog } from "./task-details-dialog";
import { cookies } from "next/headers";
import { dictionaries, Locale } from "@/lib/i18n/dictionaries";
import { unstable_noStore as noStore } from "next/cache";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function priorityBadgeClass(priority: string): string {
    switch (priority) {
        case "high":
            return "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300 dark:bg-red-500/20";
        case "medium":
            return "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300 dark:bg-amber-500/20";
        case "low":
        default:
            return "border-slate-500/40 bg-slate-500/15 text-slate-600 dark:text-slate-300 dark:bg-slate-500/20";
    }
}

function statusBadgeClass(status: string): string {
    switch (status) {
        case "active":
            return "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/20";
        case "quoted":
            return "border-blue-500/40 bg-blue-500/15 text-blue-700 dark:text-blue-300 dark:bg-blue-500/20";
        case "requested":
            return "border-slate-500/40 bg-slate-500/15 text-slate-600 dark:text-slate-300 dark:bg-slate-500/20";
        case "completed":
            return "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/20";
        case "cancelled":
        case "rejected":
            return "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300 dark:bg-red-500/20";
        default:
            return "border-slate-500/40 bg-slate-500/15 text-slate-600 dark:text-slate-300 dark:bg-slate-500/20";
    }
}

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
        <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight truncate">{t.sidebar.requests}</h1>
                <RequestsCreateWithFab />
            </div>

            <div className="grid gap-3 sm:gap-4">
                {tasks?.map((task) => (
                    <Card key={task.id} className="hover:bg-muted/50 transition-colors overflow-hidden">
                        <CardContent className="p-3 sm:p-5">
                            {/* Row 1: Title + Arrow on top right */}
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-base sm:text-lg truncate min-w-0 flex-1 pt-0.5">
                                    {task.title}
                                </h3>
                                <TaskDetailsDialog task={task}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-lg -mr-1"
                                        aria-label={t.requests.view}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </TaskDetailsDialog>
                            </div>

                            {/* Row 2: Description */}
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                                {task.description || t.requests.dialog.description}
                            </p>

                            {/* Row 3: Priority + Status + Quote */}
                            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/80">
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-[10px] sm:text-xs font-medium capitalize",
                                        priorityBadgeClass(task.priority || "low")
                                    )}
                                >
                                    {((t.requests.dialog as any)[`priority${(task.priority || "low").charAt(0).toUpperCase() + (task.priority || "low").slice(1)}`] || task.priority)}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-[10px] sm:text-xs font-medium",
                                        statusBadgeClass(task.status)
                                    )}
                                >
                                    {(t.requests.statusMap as any)[task.status] || task.status}
                                </Badge>
                                {task.quote_amount != null && (
                                    <span className="text-sm sm:text-base font-bold ml-auto">
                                        {task.quote_amount} {task.quote_currency}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {!tasks?.length && (
                    <div className="text-center py-8 sm:py-12 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                        <p className="text-sm sm:text-base">{t.requests.noRequests}</p>
                        <Button variant="link" asChild className="mt-2">
                            <Link href="/requests/new">{t.requests.createFirst}</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
