'use server';

import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { logActivity } from '@/lib/activity';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@lopes2tech.ch';

export async function saveTicketAsLead(ticket: any) {
    const supabase = await createClient();

    // Check if client already exists
    const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('contact_email', ticket.email)
        .single();

    if (existingClient) {
        return { error: 'Client with this email already exists.' };
    }

    // Create new client as lead
    const { data, error } = await supabase
        .from('clients')
        .insert({
            name: ticket.name,
            contact_email: ticket.email,
            status: 'lead'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating lead:', error);
        return { error: error.message };
    }

    await logActivity({
        action: 'create_client',
        entityType: 'client',
        entityId: data.id,
        metadata: { name: ticket.name, origin: 'ticket_conversion' }
    });

    return { success: true, client: data };
}

export async function sendTicketReply(ticketId: string, ticketEmail: string, subject: string, message: string) {
    if (!process.env.RESEND_API_KEY) {
        return { error: 'Resend API Key is missing.' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: `Lopes2Tech Admin <${FROM_EMAIL}>`,
            to: [ticketEmail],
            subject: subject,
            text: message,
            replyTo: FROM_EMAIL,
        });

        if (error) {
            console.error('Resend Error:', error);
            return { error: error.message };
        }

        // Log functionality (optional: add note to ticket?)
        // For now just log activity
        await logActivity({
            action: 'send_email', // generic log, might update types later if strict
            entityType: 'ticket',
            entityId: ticketId,
            metadata: { subject, recipient: ticketEmail }
        });

        return { success: true };
    } catch (err: any) {
        console.error('Email Send Exception:', err);
        return { error: err.message };
    }
}

export async function deleteTicket(ticketId: string, ticketName: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

    if (error) {
        console.error('Error deleting ticket:', error);
        return { error: error.message };
    }

    await logActivity({
        action: 'delete_ticket',
        entityType: 'ticket',
        entityId: ticketId,
        metadata: { name: ticketName }
    });

    return { success: true };
}
