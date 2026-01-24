"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    MessageSquare,
    Phone,
    Calendar,
    Mail,
    Plus,
    Trash2,
    Edit,
    MoreHorizontal
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { addNote, deleteNote } from "./notes-actions";
import { toast } from "sonner";

interface Note {
    id: string;
    type: 'note' | 'call' | 'meeting' | 'email';
    title: string;
    content: string | null;
    created_at: string;
    created_by: string | null;
}

interface NotesCardProps {
    clientId: string;
    notes: Note[];
}

const typeIcons = {
    note: MessageSquare,
    call: Phone,
    meeting: Calendar,
    email: Mail,
};

const typeColors = {
    note: "bg-blue-500/10 text-blue-500",
    call: "bg-green-500/10 text-green-500",
    meeting: "bg-purple-500/10 text-purple-500",
    email: "bg-orange-500/10 text-orange-500",
};

export function NotesCard({ clientId, notes }: NotesCardProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newNote, setNewNote] = useState({
        type: 'note' as 'note' | 'call' | 'meeting' | 'email',
        title: '',
        content: ''
    });

    async function handleAddNote() {
        if (!newNote.title.trim()) {
            toast.error("Title is required");
            return;
        }

        setIsSubmitting(true);
        try {
            await addNote({
                client_id: clientId,
                type: newNote.type,
                title: newNote.title,
                content: newNote.content || undefined
            });
            toast.success("Note added");
            setNewNote({ type: 'note', title: '', content: '' });
            setIsDialogOpen(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add note");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDeleteNote(noteId: string) {
        try {
            await deleteNote(noteId, clientId);
            toast.success("Note deleted");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete note");
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Internal Notes
                    </CardTitle>
                    <CardDescription>
                        Track calls, meetings, and notes about this client
                    </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Note
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Note</DialogTitle>
                            <DialogDescription>
                                Record a call, meeting, or general note about this client.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select
                                    value={newNote.type}
                                    onValueChange={(value) => setNewNote({ ...newNote, type: value as typeof newNote.type })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="note">📝 Note</SelectItem>
                                        <SelectItem value="call">📞 Call</SelectItem>
                                        <SelectItem value="meeting">📅 Meeting</SelectItem>
                                        <SelectItem value="email">📧 Email</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    placeholder="Brief summary..."
                                    value={newNote.title}
                                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Details (optional)</label>
                                <Textarea
                                    placeholder="Additional details..."
                                    rows={4}
                                    value={newNote.content}
                                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddNote} disabled={isSubmitting}>
                                {isSubmitting ? "Adding..." : "Add Note"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {notes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No notes yet</p>
                        <p className="text-sm">Add your first note to track interactions</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notes.map((note) => {
                            const Icon = typeIcons[note.type] || MessageSquare;
                            return (
                                <div
                                    key={note.id}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                                >
                                    <div className={`p-2 rounded-md ${typeColors[note.type]}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium truncate">{note.title}</span>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {note.type}
                                            </Badge>
                                        </div>
                                        {note.content && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {note.content}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                                        </p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => handleDeleteNote(note.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
