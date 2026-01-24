"use client";

import { motion } from "framer-motion";
import {
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    FileText,
    Flag,
    LayoutDashboard,
    MoreVertical,
    TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface ProjectDashboardProps {
    project: any;
    milestones: any[];
    invoices: any[];
}

export default function ProjectDashboard({ project, milestones, invoices }: ProjectDashboardProps) {
    const { t } = useLanguage();

    // Calculate financial stats
    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalPaid = invoices.reduce((sum, inv) => {
        if (inv.status === 'paid') return sum + Number(inv.amount);
        return sum + Number(inv.amount_paid || 0);
    }, 0);
    const paymentProgress = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    // Helper to translate status
    const translateStatus = (status: string) => {
        const key = status.toLowerCase() as keyof typeof t.projects.statusMap;
        return t.projects.statusMap[key] || status;
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-8"
        >
            {/* Header / Back Link */}
            <motion.div variants={item}>
                <Link
                    href="/dashboard/projects"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mb-4"
                >
                    ← {t.projects.backToProjects}
                </Link>

                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <LayoutDashboard className="w-64 h-64 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 md:items-start">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <Badge
                                    className={cn(
                                        "px-3 py-1 text-sm capitalize",
                                        project.status === 'active' ? "bg-green-500 hover:bg-green-600" : "bg-secondary"
                                    )}
                                >
                                    {translateStatus(project.status)}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {t.projects.lastUpdated}: {new Date(project.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                {project.name}
                            </h1>

                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {project.description}
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-2 min-w-[200px] bg-background/50 backdrop-blur-sm p-6 rounded-2xl border shadow-sm">
                            <span className="text-sm font-medium text-muted-foreground">{t.projects.overallCompletion}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-primary">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2 w-full mt-2" />
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Timeline & Tasks */}
                <motion.div variants={item} className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Flag className="w-5 h-5 text-primary" />
                            {t.projects.roadmap}
                        </h2>
                    </div>

                    <div className="relative pl-8 border-l-2 border-muted space-y-12 py-4">
                        {milestones?.map((milestone, index) => {
                            const isCompleted = milestone.status === 'completed';
                            const isNext = !isCompleted && (index === 0 || milestones[index - 1]?.status === 'completed');

                            return (
                                <motion.div
                                    key={milestone.id}
                                    variants={item}
                                    className="relative group"
                                >
                                    {/* Timeline Dot */}
                                    <div className={cn(
                                        "absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 transition-colors duration-300",
                                        isCompleted ? "bg-primary border-primary" :
                                            isNext ? "bg-background border-primary ring-4 ring-primary/20" : "bg-background border-muted-foreground"
                                    )} />

                                    <div className={cn(
                                        "p-6 rounded-xl border bg-card transition-all duration-300 hover:shadow-lg",
                                        isNext ? "ring-2 ring-primary/10 shadow-md" : ""
                                    )}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                {isNext && (
                                                    <span className="text-xs font-bold text-primary mb-1 block uppercase tracking-wider">
                                                        {t.projects.nextUp}
                                                    </span>
                                                )}
                                                <h3 className={cn(
                                                    "text-lg font-semibold flex items-center gap-2",
                                                    isCompleted && "text-muted-foreground line-through"
                                                )}>
                                                    {milestone.title}
                                                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {milestone.description || "No description provided"}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {milestone.due_date && (
                                                    <div className="text-sm font-medium px-3 py-1 rounded-full bg-secondary">
                                                        {t.projects.due} {new Date(milestone.due_date).toLocaleDateString('en-GB')}
                                                    </div>
                                                )}
                                                <Badge
                                                    variant={isCompleted ? 'secondary' : 'outline'}
                                                    className={cn(
                                                        isCompleted ? "bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20" :
                                                            milestone.status === 'pending' ? "bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25 border-yellow-500/20" : ""
                                                    )}
                                                >
                                                    {translateStatus(milestone.status)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {!milestones?.length && (
                            <div className="text-muted-foreground italic pl-2">No milestones defined for this project yet.</div>
                        )}
                    </div>
                </motion.div>

                {/* Right Column: Financials & Quick Actions */}
                <motion.div variants={item} className="space-y-8">
                    {/* Financial Card */}
                    <Card className={cn(
                        "overflow-hidden border-none shadow-lg bg-gradient-to-br from-card to-card/50 relative",
                        paymentProgress >= 100 && totalInvoiced > 0 && "after:content-[attr(data-watermark)] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:-rotate-45 after:text-6xl after:font-black after:text-green-500/10 after:pointer-events-none before:absolute before:inset-0 before:bg-green-500/5"
                    )} data-watermark={t.projects.paidWatermark}>
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                {t.projects.projectBudget}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">{t.projects.totalInvoiced}</span>
                                    <span className="text-lg font-bold">CHF {totalInvoiced.toLocaleString()}</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>{t.projects.paidAmount}</span>
                                        <span className="font-medium text-green-500">CHF {totalPaid.toLocaleString()}</span>
                                    </div>
                                    <Progress value={paymentProgress} className="h-3" />
                                </div>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={invoices.length === 1 ? `/dashboard/invoices/${invoices[0].id}` : `/dashboard/invoices?project_id=${project.id}`}>
                                        {t.projects.viewInvoices}
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MoreVertical className="w-5 h-5" />
                            {t.dashboard.quickActions}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors gap-2 text-center h-24"
                            >
                                <FileText className="w-6 h-6 text-primary" />
                                <span className="text-sm font-medium">{t.projects.documents}</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors gap-2 text-center h-24"
                            >
                                <CreditCard className="w-6 h-6 text-primary" />
                                <span className="text-sm font-medium">{t.projects.makeRequest}</span>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
