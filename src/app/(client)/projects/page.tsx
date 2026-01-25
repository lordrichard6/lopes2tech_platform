import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderKanban, ArrowRight, Calendar, CheckSquare, Receipt, FileText } from "lucide-react";
import { cookies } from "next/headers";
import { dictionaries, Locale } from "@/lib/i18n/dictionaries";

export default async function ProjectsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get locale from cookie
    const cookieStore = await cookies();
    const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'en') as Locale;
    const t = dictionaries[locale];

    // Fetch projects with related counts
    // Using count: 'exact' inside the nested select to get the number of related rows
    const { data: projects, error } = await supabase
        .from("projects")
        .select("*, milestones(count), invoices(count)")
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching projects:", error);
    }

    // Helper to translate status
    const translateStatus = (status: string) => {
        const key = status.toLowerCase() as keyof typeof t.projects.statusMap;
        return t.projects.statusMap[key] || status;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t.projects.title}</h1>
                    <p className="text-muted-foreground">{t.projects.subtitle}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects?.map((project) => {
                    const taskCount = project.milestones?.[0]?.count || 0;
                    const invoiceCount = project.invoices?.[0]?.count || 0;

                    return (
                        <Card key={project.id} className="flex flex-col hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge
                                        variant={project.status === 'active' ? 'default' : 'secondary'}
                                        className="capitalize"
                                    >
                                        {translateStatus(project.status)}
                                    </Badge>
                                    {project.due_date && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {t.projects.due} {new Date(project.due_date).toLocaleDateString(locale === 'en' ? 'en-US' : 'en-GB')}
                                        </span>
                                    )}
                                </div>
                                <CardTitle className="text-xl">{project.name}</CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                    {project.description || "No description provided."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-6">
                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{t.projects.progress}</span>
                                        <span className="font-medium">{project.progress || 0}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{ width: `${project.progress || 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Quick Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <Receipt className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="text-sm font-medium">{invoiceCount}</div>
                                            <div className="text-xs text-muted-foreground">{t.projects.documents}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <CheckSquare className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="text-sm font-medium">{taskCount}</div>
                                            <div className="text-xs text-muted-foreground">{t.projects.roadmap}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button asChild className="w-full">
                                    <Link href={`/projects/${project.id}`}>
                                        {t.projects.viewDetails} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}

                {!projects?.length && (
                    <div className="md:col-span-2 lg:col-span-3">
                        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg bg-muted/50">
                            <FolderKanban className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                            <h3 className="text-lg font-medium">{t.common.noData}</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-2">
                                {t.projects.subtitle}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
