'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cancelTaskAction, updateTaskAction } from "./actions";
import { updateTaskStatusAction } from "./[id]/actions";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { Loader2, Pencil, Check } from "lucide-react";

function formatDate(date: string | Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

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

interface TaskDetailsDialogProps {
    task: any;
    children: React.ReactNode;
}

export function TaskDetailsDialog({ task, children }: TaskDetailsDialogProps) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const toggleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsEditing(!isEditing);
    };

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);
        try {
            const formData = new FormData(e.currentTarget);
            const result = await updateTaskAction(formData);
            if (result?.success) {
                setIsEditing(false);
                setOpen(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsPending(false);
        }
    };

    const handleCancelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);
        try {
            const formData = new FormData(e.currentTarget);
            const result = await cancelTaskAction(formData);
            if (result?.success) {
                setOpen(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsPending(false);
        }
    };

    const handleStatusSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);
        try {
            const formData = new FormData(e.currentTarget);
            const result = await updateTaskStatusAction(formData);
            if (result?.success) {
                setOpen(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) setIsEditing(false);
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader className="space-y-2">
                    <div className="flex justify-between items-start gap-3 pr-2">
                        <DialogTitle className="text-lg sm:text-xl leading-tight break-words min-w-0">
                            {isEditing ? t.requests.dialog.edit : task.title}
                        </DialogTitle>
                        {!isEditing && (
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge
                                    variant="outline"
                                    className={cn("capitalize text-xs font-medium", statusBadgeClass(task.status))}
                                >
                                    {(t.requests.statusMap as any)[task.status] || task.status}
                                </Badge>
                                {task.status === 'requested' && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleEdit} aria-label={t.requests.dialog.requestTitle}>
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                    {!isEditing && (
                        <DialogDescription asChild>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                <span>{t.requests.createdOn} {formatDate(task.created_at)}</span>
                                <span aria-hidden className="text-border">•</span>
                                <Badge
                                    variant="outline"
                                    className={cn("text-[10px] font-medium capitalize", priorityBadgeClass(task.priority || 'low'))}
                                >
                                    {(t.requests.dialog as any)[`priority${(task.priority || 'low').charAt(0).toUpperCase() + (task.priority || 'low').slice(1)}`] || task.priority}
                                </Badge>
                            </div>
                        </DialogDescription>
                    )}
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-2">
                    {isEditing ? (
                        <form id="edit-form" onSubmit={handleEditSubmit} className="space-y-4 py-2">
                            <input type="hidden" name="taskId" value={task.id} />
                            <div className="space-y-2">
                                <Label htmlFor="title">{t.requests.dialog.requestTitle}</Label>
                                <Input id="title" name="title" defaultValue={task.title} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priority">{t.requests.priority}</Label>
                                <Select name="priority" defaultValue={task.priority}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">{t.requests.dialog.priorityLow}</SelectItem>
                                        <SelectItem value="medium">{t.requests.dialog.priorityMedium}</SelectItem>
                                        <SelectItem value="high">{t.requests.dialog.priorityHigh}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">{t.requests.description}</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={task.description}
                                    className="min-h-[100px]"
                                />
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-5 py-2">
                            <section>
                                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">{t.requests.description}</h4>
                                <p className="text-sm text-foreground/90 whitespace-pre-wrap rounded-md bg-muted/30 px-3 py-2.5 border border-border/60">
                                    {task.description || t.requests.dialog.description}
                                </p>
                            </section>

                            {task.quote_amount != null && (
                                <section className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">{t.requests.quoteReceived}</h4>
                                    <div className="text-2xl sm:text-3xl font-bold flex items-baseline gap-1.5">
                                        {task.quote_amount} <span className="text-base font-normal text-muted-foreground">{task.quote_currency}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                                        Review the quote above. Approving this request will mark it as active and we will begin work.
                                    </p>
                                </section>
                            )}
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter className="gap-2 sm:gap-0">
                    {/* ACTIONS */}
                    {isEditing ? (
                        <div className="flex w-full justify-end gap-2">
                            <Button variant="ghost" onClick={toggleEdit} disabled={isPending}>{t.requests.dialog.cancel}</Button>
                            <Button type="submit" form="edit-form" disabled={isPending}>
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                {t.requests.dialog.save}
                            </Button>
                        </div>
                    ) : (
                        <>
                            {task.status === 'requested' && (
                                <div className="flex w-full justify-between items-center">
                                    <span className="text-xs text-muted-foreground">{t.requests.dialog.waiting}</span>
                                    <form onSubmit={handleCancelSubmit}>
                                        <input type="hidden" name="taskId" value={task.id} />
                                        <Button type="submit" variant="destructive" disabled={isPending} size="sm">
                                            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            {t.requests.cancelRequest}
                                        </Button>
                                    </form>
                                </div>
                            )}

                            {task.status === 'quoted' && (
                                <div className="flex w-full justify-end gap-2">
                                    <form onSubmit={handleStatusSubmit}>
                                        <input type="hidden" name="taskId" value={task.id} />
                                        <input type="hidden" name="status" value="rejected" />
                                        <Button type="submit" variant="destructive" disabled={isPending}>
                                            {t.requests.declineQuote}
                                        </Button>
                                    </form>
                                    <form onSubmit={handleStatusSubmit}>
                                        <input type="hidden" name="taskId" value={task.id} />
                                        <input type="hidden" name="status" value="active" />
                                        <Button type="submit" disabled={isPending}>
                                            {t.requests.approveQuote}
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
