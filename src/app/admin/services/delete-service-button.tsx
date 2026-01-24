"use client";

import { useState } from "react";
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
import { deleteService } from "./actions";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteServiceButtonProps {
    id: string;
    trigger?: React.ReactNode;
}

export function DeleteServiceButton({ id, trigger }: DeleteServiceButtonProps) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteService(id);
            toast.success("Service deleted");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to delete service");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <DialogTitle>Delete Service?</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        This action cannot be undone. This will permanently delete the service from your catalog.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete Service"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
