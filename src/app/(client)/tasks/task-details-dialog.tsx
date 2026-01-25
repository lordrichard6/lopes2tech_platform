"use client";

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

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, X, Check } from "lucide-react";

interface TaskDetailsDialogProps {
    task: any;
    children: React.ReactNode;
}

export function TaskDetailsDialog({ task, children }: TaskDetailsDialogProps) {
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, setIsPending] = useState(false);

    // Helper to wrap server action
    const wrapAction = (action: (fd: FormData) => Promise<any>) => async (formData: FormData) => {
        setIsPending(true);
        try {
            const result = await action(formData);
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

    const toggleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsEditing(!isEditing);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) setIsEditing(false);
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex justify-between items-start pr-4">
                        <DialogTitle className="text-xl">
                            {isEditing ? "Edit Request" : task.title}
                        </DialogTitle>
                        {!isEditing && (
                            <div className="flex items-center gap-2">
                                <Badge variant={
                                    task.status === 'requested' ? 'secondary' :
                                        task.status === 'quoted' ? 'default' :
                                            task.status === 'active' ? 'outline' : 'secondary'
                                } className="capitalize">
                                    {task.status}
                                </Badge>
                                {task.status === 'requested' && (
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleEdit}>
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                    {!isEditing && (
                        <DialogDescription>
                            Created on {new Date(task.created_at).toLocaleDateString()} • {task.priority} Priority
                        </DialogDescription>
                    )}
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    {isEditing ? (
                        <form id="edit-form" action={wrapAction(updateTaskAction)} className="space-y-4 py-4">
                            <input type="hidden" name="taskId" value={task.id} />
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" defaultValue={task.title} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select name="priority" defaultValue={task.priority}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={task.description}
                                    className="min-h-[100px]"
                                />
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6 py-4">
                            <div>
                                <h4 className="text-sm font-medium mb-2">Description</h4>
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
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter className="gap-2 sm:gap-0">
                    {/* ACTIONS */}
                    {isEditing ? (
                        <div className="flex w-full justify-end gap-2">
                            <Button variant="ghost" onClick={toggleEdit} disabled={isPending}>Cancel</Button>
                            <Button type="submit" form="edit-form" disabled={isPending}>
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                        </div>
                    ) : (
                        <>
                            {task.status === 'requested' && (
                                <div className="flex w-full justify-between items-center">
                                    <span className="text-xs text-muted-foreground">Waiting for review...</span>
                                    <form action={wrapAction(cancelTaskAction)}>
                                        <input type="hidden" name="taskId" value={task.id} />
                                        <Button type="submit" variant="destructive" disabled={isPending} size="sm">
                                            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Cancel Request
                                        </Button>
                                    </form>
                                </div>
                            )}

                            {task.status === 'quoted' && (
                                <div className="flex w-full justify-end gap-2">
                                    <form action={wrapAction(updateTaskStatusAction)}>
                                        <input type="hidden" name="taskId" value={task.id} />
                                        <input type="hidden" name="status" value="rejected" />
                                        <Button type="submit" variant="destructive" disabled={isPending}>
                                            Decline
                                        </Button>
                                    </form>
                                    <form action={wrapAction(updateTaskStatusAction)}>
                                        <input type="hidden" name="taskId" value={task.id} />
                                        <input type="hidden" name="status" value="active" />
                                        <Button type="submit" disabled={isPending}>
                                            Approve Quote
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
