
"use client";

import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FolderKanban, FileText, Receipt, ArrowRight, Download } from "lucide-react";

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

    // Greeting logic (translated)
    // We can use simple time logic locally, or just rely on 'welcome' from dict
    // But 'Good morning' etc needs keys if we want that detail.
    // Dictionaries have 'welcome'. Let's use `t.dashboard.welcome`.

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {t.dashboard.welcome}, {clientName.split(' ')[0]}! 👋
                </h1>
                <p className="text-muted-foreground">
                    {t.auth.subtitle} {/* reusing "Enter credentials..." isn't quite right, let's use a generic subtitle if available or static fallback */}
                    {/* Actually dictionary checks: */}
                    {/* t.dashboard.welcome is "Welcome back" */}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t.dashboard.activeProjects}</CardTitle>
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeProjectsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalProjectsCount} {t.dashboard.totalProjects}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t.dashboard.pendingInvoices}</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {pendingInvoicesCount > 0 ? `CHF ${pendingAmount.toFixed(0)}` : t.invoices.statusMap.paid}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {pendingInvoicesCount} {t.dashboard.pending}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t.dashboard.sharedDocuments}</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{documentCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {t.dashboard.filesAvailable}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Projects Section */}
                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{t.projects.title}</CardTitle>
                            <CardDescription>{t.projects.subtitle}</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/projects" className="gap-1">
                                {t.projects.viewDetails} <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {projects?.length ? (
                            <div className="space-y-4">
                                {projects.map((project) => (
                                    <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                        <div className="space-y-1">
                                            <p className="font-medium">{project.name}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                                    {t.projects.statusMap[project.status as keyof typeof t.projects.statusMap] || project.status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">{project.progress}% {t.projects.progress}</span>
                                            </div>
                                        </div>
                                        <div className="w-20">
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${project.progress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <FolderKanban className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>{t.common.noData}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Documents Section */}
                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{t.documents.title}</CardTitle>
                            <CardDescription>{t.documents.subtitle}</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/documents" className="gap-1">
                                {t.projects.viewDetails} <ArrowRight className="h-4 w-4" />
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
