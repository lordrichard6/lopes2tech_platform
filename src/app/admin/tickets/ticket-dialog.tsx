'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Mail, Phone, Building, UserPlus, Send, Loader2, Trash2 } from 'lucide-react';
import { saveTicketAsLead, sendTicketReply, deleteTicket } from './actions';
import { toast } from 'sonner';

interface Ticket {
    id: string;
    created_at: string;
    name: string;
    email: string;
    company: string | null;
    phone: string | null;
    message: string;
    status: 'new' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    context: string;
    source?: string;
}

interface TicketDialogProps {
    ticket: Ticket | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: () => void;
}

export function TicketDialog({ ticket, open, onOpenChange, onUpdate }: TicketDialogProps) {
    const supabase = createClient();
    const [updating, setUpdating] = useState(false);

    // Email Reply State
    const [replySubject, setReplySubject] = useState('');
    const [replyMessage, setReplyMessage] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);

    // Save Lead State
    const [savingLead, setSavingLead] = useState(false);

    // Delete State
    const [deleting, setDeleting] = useState(false);

    if (!ticket) return null;

    const updateStatus = async (status: string) => {
        setUpdating(true);
        await supabase.from('tickets').update({ status }).eq('id', ticket.id);
        setUpdating(false);
        onUpdate();
        toast.success(`Status updated to ${status}`);
    };

    const updatePriority = async (priority: string) => {
        setUpdating(true);
        await supabase.from('tickets').update({ priority }).eq('id', ticket.id);
        setUpdating(false);
        onUpdate();
        toast.success(`Priority updated to ${priority}`);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        const result = await deleteTicket(ticket.id, ticket.name);
        setDeleting(false);

        if (result.success) {
            toast.success('Ticket deleted successfully');
            onOpenChange(false);
            onUpdate();
        } else {
            toast.error(result.error || 'Failed to delete ticket');
        }
    };

    const handleSaveAsLead = async () => {
        setSavingLead(true);
        const result = await saveTicketAsLead(ticket);
        setSavingLead(false);

        if (result.success) {
            toast.success('Client created successfully!');
        } else {
            toast.error(result.error || 'Failed to create client');
        }
    };

    const handleSendReply = async () => {
        if (!replySubject || !replyMessage) {
            toast.error('Please fill in subject and message');
            return;
        }

        setSendingEmail(true);
        const result = await sendTicketReply(ticket.id, ticket.email, replySubject, replyMessage);
        setSendingEmail(false);

        if (result.success) {
            toast.success('Email sent successfully!');
            setReplySubject('');
            setReplyMessage('');
            // Optionally update ticket status to 'in_progress'
            if (ticket.status === 'new') {
                updateStatus('in_progress');
            }
        } else {
            toast.error(result.error || 'Failed to send email');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-2">
                            <Badge variant="outline">{ticket.context}</Badge>
                            {ticket.source && <Badge variant="secondary">{ticket.source}</Badge>}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {format(new Date(ticket.created_at), 'PPP p')}
                        </span>
                    </div>
                    <DialogTitle className="text-2xl">{ticket.name}</DialogTitle>
                    <DialogDescription>
                        Details of the inquiry.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Actions Toolbar */}
                    <div className="flex flex-wrap gap-3 items-center p-3 bg-muted/20 rounded-lg">
                        <Select value={ticket.status} onValueChange={updateStatus} disabled={updating}>
                            <SelectTrigger className="w-[150px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={ticket.priority} onValueChange={updatePriority} disabled={updating}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex-1" />

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleSaveAsLead}
                            disabled={savingLead}
                        >
                            {savingLead ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                            Save as Lead
                        </Button>

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Delete
                        </Button>
                    </div>

                    <Separator />

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-muted-foreground">Contact Details</h4>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a href={`mailto:${ticket.email}`} className="text-blue-600 hover:underline">
                                    {ticket.email}
                                </a>
                            </div>
                            {ticket.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <a href={`tel:${ticket.phone}`} className="hover:underline">
                                        {ticket.phone}
                                    </a>
                                </div>
                            )}
                            {ticket.company && (
                                <div className="flex items-center gap-3">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span>{ticket.company}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-muted-foreground">Source Info</h4>
                            <p>Context: {ticket.context}</p>
                            <p>Source: {ticket.source || 'N/A'}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Message */}
                    <div>
                        <h4 className="font-semibold mb-2">Message</h4>
                        <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-wrap text-sm leading-relaxed border">
                            {ticket.message}
                        </div>
                    </div>

                    <Separator />

                    {/* Reply Section */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border">
                        <h4 className="font-semibold flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Reply to {ticket.name}
                        </h4>
                        <Input
                            placeholder="Subject"
                            value={replySubject}
                            onChange={(e) => setReplySubject(e.target.value)}
                        />
                        <Textarea
                            placeholder="Write your reply here..."
                            className="min-h-[100px]"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button
                                onClick={handleSendReply}
                                disabled={sendingEmail || !replyMessage || !replySubject}
                            >
                                {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                Send Email
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
