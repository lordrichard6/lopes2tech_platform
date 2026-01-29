'use client';

import { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createTaskAction } from "./actions";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";

export type CreateRequestDialogRef = { open: () => void };

interface CreateRequestDialogProps {
    /** When true, no trigger is rendered; use ref.current.open() to open. */
    externalTrigger?: boolean;
}

export const CreateRequestDialog = forwardRef<CreateRequestDialogRef, CreateRequestDialogProps>(
    function CreateRequestDialog({ externalTrigger }, ref) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useImperativeHandle(ref, () => ({ open: () => setOpen(true) }), []);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            const result = await createTaskAction(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(t.requests.dialog.success);
                setOpen(false);
            }
        } catch (error) {
            toast.error(t.requests.dialog.error);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!externalTrigger && (
                <DialogTrigger asChild>
                    <Button size="icon" className="h-9 w-9 shrink-0 rounded-lg" aria-label={t.requests.newRequest}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t.requests.dialog.title}</DialogTitle>
                    <DialogDescription>
                        {t.requests.dialog.description}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (isLoading) return;
                    const formData = new FormData(e.currentTarget);
                    handleSubmit(formData);
                }}>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="title">{t.requests.dialog.requestTitle}</Label>
                            <Input id="title" name="title" placeholder="e.g. Add Blog Section" required />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="priority">{t.requests.priority}</Label>
                            <Select name="priority" defaultValue="medium">
                                <SelectTrigger>
                                    <SelectValue placeholder={t.requests.dialog.priorityPlaceholder} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">{t.requests.dialog.priorityLow}</SelectItem>
                                    <SelectItem value="medium">{t.requests.dialog.priorityMedium}</SelectItem>
                                    <SelectItem value="high">{t.requests.dialog.priorityHigh}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="description">{t.requests.dialog.details}</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            {t.requests.dialog.cancel}
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.requests.dialog.submit}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
});

/** On small devices: fixed FAB bottom-right. On md+: inline button in header. */
export function RequestsCreateWithFab() {
    const { t } = useLanguage();
    const dialogRef = useRef<CreateRequestDialogRef>(null);

    return (
        <>
            <div className="hidden md:block shrink-0">
                <CreateRequestDialog />
            </div>
            <Button
                size="icon"
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl shadow-lg shadow-primary/25 md:hidden"
                aria-label={t.requests.newRequest}
                onClick={() => dialogRef.current?.open()}
            >
                <Plus className="h-6 w-6" />
            </Button>
            <CreateRequestDialog ref={dialogRef} externalTrigger />
        </>
    );
}
