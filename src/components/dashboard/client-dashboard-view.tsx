
"use client";

import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FolderKanban, FileText, Receipt, ArrowRight, Download, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientDashboardViewProps {
    clientName: string;
    projects: any[];
    documents: any[];
    invoices: any[];
    activeProjectsCount: number;
    totalProjectsCount: number;
    pendingInvoicesCount: number;
    pendingAmount: number;
    documentCount: number;
}

export function ClientDashboardView({
    clientName,
    projects,
    documents,
    invoices,
    activeProjectsCount,
    totalProjectsCount,
    pendingInvoicesCount,
    pendingAmount,
    documentCount
}: ClientDashboardViewProps) {
    const { t } = useLanguage();

    // Time-based greeting using local time and translated phrases
    const hour = new Date().getHours();
    const isMorning = hour < 12;
    const greeting = isMorning ? t.dashboard.greetingMorning : t.dashboard.greetingAfternoon;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.2em]">
                    {t.dashboard.pageTitle}
                </p>
                <h1 className="text-3xl font-bold tracking-tight">
                    {greeting}, {clientName.split(' ')[0]}! 👋
                </h1>
            </div>

            {/* Stats Cards – compact on small devices, full on md+ */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                <Link href="/projects" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg">
                    <Card className={cn(
                        "h-full transition-all duration-200 py-3 px-3 gap-2 md:py-6 md:gap-6 md:px-6",
                        "hover:border-primary/40 hover:shadow-md hover:shadow-primary/5",
                        "cursor-pointer group"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-1 md:pb-2">
                            <CardTitle className="text-xs font-medium md:text-sm line-clamp-1">{t.dashboard.activeProjects}</CardTitle>
                            <span className="flex h-7 w-7 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                                <FolderKanban className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </span>
                        </CardHeader>
                        <CardContent className="p-0 pt-0">
                            <div className="text-xl font-bold tracking-tight md:text-3xl">{activeProjectsCount}</div>
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {totalProjectsCount} {t.dashboard.totalProjects}
                            </p>
                            <p className="text-xs text-primary font-medium mt-1 md:mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 hidden sm:flex">
                                {t.projects.viewDetails} <ChevronRight className="h-3.5 w-3.5" />
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/invoices" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg">
                    <Card className={cn(
                        "h-full transition-all duration-200 py-3 px-3 gap-2 md:py-6 md:gap-6 md:px-6",
                        "hover:border-primary/40 hover:shadow-md hover:shadow-primary/5",
                        "cursor-pointer group"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-1 md:pb-2">
                            <CardTitle className="text-xs font-medium md:text-sm line-clamp-1">{t.dashboard.pendingInvoices}</CardTitle>
                            <span className="flex h-7 w-7 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                                <Receipt className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </span>
                        </CardHeader>
                        <CardContent className="p-0 pt-0">
                            <div className="text-xl font-bold tracking-tight md:text-3xl">
                                {pendingInvoicesCount > 0 ? `CHF ${pendingAmount.toFixed(0)}` : t.invoices.statusMap.paid}
                            </div>
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {pendingInvoicesCount} {t.dashboard.pending}
                            </p>
                            <p className="text-xs text-primary font-medium mt-1 md:mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 hidden sm:flex">
                                {t.projects.viewDetails} <ChevronRight className="h-3.5 w-3.5" />
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/documents" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg">
                    <Card className={cn(
                        "h-full transition-all duration-200 py-3 px-3 gap-2 md:py-6 md:gap-6 md:px-6",
                        "hover:border-primary/40 hover:shadow-md hover:shadow-primary/5",
                        "cursor-pointer group"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-1 md:pb-2">
                            <CardTitle className="text-xs font-medium md:text-sm line-clamp-1">{t.dashboard.sharedDocuments}</CardTitle>
                            <span className="flex h-7 w-7 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                                <FileText className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </span>
                        </CardHeader>
                        <CardContent className="p-0 pt-0">
                            <div className="text-xl font-bold tracking-tight md:text-3xl">{documentCount}</div>
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {t.dashboard.filesAvailable}
                            </p>
                            <p className="text-xs text-primary font-medium mt-1 md:mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 hidden sm:flex">
                                {t.projects.viewDetails} <ChevronRight className="h-3.5 w-3.5" />
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Projects Section */}
                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2 pb-3 sm:pb-6">
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base sm:text-lg">{t.projects.title}</CardTitle>
                            <CardDescription className="text-xs sm:text-sm mt-0.5">{t.projects.subtitle}</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-lg" asChild aria-label={t.projects.viewDetails}>
                            <Link href="/projects">
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {projects?.length ? (
                            <div className="space-y-2 sm:space-y-3">
                                {projects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/projects/${project.id}`}
                                        className={cn(
                                            "block rounded-lg border bg-card transition-colors",
                                            "p-2.5 sm:p-3 hover:bg-muted/50 hover:border-primary/30",
                                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                        )}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                <p className="font-medium text-sm sm:text-base truncate">{project.name}</p>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-[10px] sm:text-xs w-fit">
                                                        {t.projects.statusMap[project.status as keyof typeof t.projects.statusMap] || project.status}
                                                    </Badge>
                                                    <span className="text-[10px] sm:text-xs text-muted-foreground">{project.progress}% {t.projects.progress}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="flex-1 sm:flex-none sm:w-20 h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden min-w-0">
                                                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 sm:hidden" aria-hidden />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 sm:py-8 text-muted-foreground">
                                <FolderKanban className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">{t.common.noData}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Documents Section */}
                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2 pb-3 sm:pb-6">
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base sm:text-lg">{t.documents.title}</CardTitle>
                            <CardDescription className="text-xs sm:text-sm mt-0.5">{t.documents.subtitle}</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-lg" asChild aria-label={t.projects.viewDetails}>
                            <Link href="/documents">
                                <ArrowRight className="h-4 w-4" />
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
                                <p>{t.documents.noDocs}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>{t.dashboard.quickActions}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/documents">{t.dashboard.viewDocuments}</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/settings">{t.dashboard.editProfile}</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="mailto:support@lopes2tech.ch">{t.dashboard.contactSupport}</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
