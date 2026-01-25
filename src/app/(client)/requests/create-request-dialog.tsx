'use client';

import { useState } from 'react';
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
import { toast } from "sonner"; // Assuming sonner is used, typical in shadcn/ui setups. If not, can fallback to alert or other.
import { useLanguage } from "@/contexts/language-context";

export function CreateRequestDialog() {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t.requests.newRequest}
                </Button>
            </DialogTrigger>
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
}
