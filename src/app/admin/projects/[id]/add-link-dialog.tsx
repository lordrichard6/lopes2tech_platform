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
    Github,
    Figma,
    Trello,
    Slack,
    Link as LinkIcon,
    File,
    Globe,
    Server,
    Database,
    Image,
    Video,
    Box,
    Loader2,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createLinkAction } from "./links-actions";
import { toast } from "sonner";

const ICONS = [
    { name: 'github', icon: Github, label: 'Github' },
    { name: 'figma', icon: Figma, label: 'Figma' },
    { name: 'trello', icon: Trello, label: 'Trello' },
    { name: 'slack', icon: Slack, label: 'Slack' },
    { name: 'link', icon: LinkIcon, label: 'Link' },
    { name: 'file', icon: File, label: 'File' },
    { name: 'globe', icon: Globe, label: 'Website' },
    { name: 'server', icon: Server, label: 'Server' },
    { name: 'database', icon: Database, label: 'Database' },
    { name: 'image', icon: Image, label: 'Image' },
    { name: 'video', icon: Video, label: 'Video' },
    { name: 'box', icon: Box, label: 'Other' },
];

export function AddLinkDialog({ projectId }: { projectId: string }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState('link');

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            const result = await createLinkAction(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Link added successfully");
                setOpen(false);
            }
        } catch (error) {
            toast.error("Failed to add link");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add Link
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Important Link</DialogTitle>
                    <DialogDescription>
                        Add a link to external resources for this project.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <input type="hidden" name="projectId" value={projectId} />
                    <input type="hidden" name="icon" value={selectedIcon} />

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Link Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Design Files" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="url">URL</Label>
                            <Input id="url" name="url" placeholder="https://..." required type="url" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Icon</Label>
                            <div className="grid grid-cols-6 gap-2 p-2 border rounded-lg bg-muted/20">
                                {ICONS.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.name}
                                            type="button"
                                            onClick={() => setSelectedIcon(item.name)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-2 rounded-md transition-all hover:bg-muted",
                                                selectedIcon === item.name
                                                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            <Icon className="h-5 w-5 mb-1" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Short description of this resource..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Link
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
