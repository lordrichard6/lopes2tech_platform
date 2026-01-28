
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
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
import { Mail, Phone, Building, Calendar, Tag, Trash2 } from 'lucide-react';

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
}

interface TicketSheetProps {
    ticket: Ticket | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: () => void;
}

export function TicketSheet({ ticket, open, onOpenChange, onUpdate }: TicketSheetProps) {
    const supabase = createClient();
    const [updating, setUpdating] = useState(false);

    if (!ticket) return null;

    const updateStatus = async (status: string) => {
        setUpdating(true);
        await supabase.from('tickets').update({ status }).eq('id', ticket.id);
        setUpdating(false);
        onUpdate();
    };

    const updatePriority = async (priority: string) => {
        setUpdating(true);
        await supabase.from('tickets').update({ priority }).eq('id', ticket.id);
        setUpdating(false);
        onUpdate();
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{ticket.context}</Badge>
                        <span className="text-sm text-muted-foreground">
                            {format(new Date(ticket.created_at), 'PPP p')}
                        </span>
                    </div>
                    <SheetTitle className="text-2xl">{ticket.name}</SheetTitle>
                    <SheetDescription>
                        Details of the inquiry submitted via the website.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Actions */}
                    <div className="flex gap-2">
                        <Select value={ticket.status} onValueChange={updateStatus} disabled={updating}>
                            <SelectTrigger className="w-[180px]">
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
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    {/* Contact Info */}
                    <div className="grid gap-4">
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

                    <Separator />

                    {/* Message */}
                    <div>
                        <h4 className="font-semibold mb-2">Message</h4>
                        <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                            {ticket.message}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
