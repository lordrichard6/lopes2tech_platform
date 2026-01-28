'use server'
import { sendPaymentConfirmedEmail } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function confirmPaymentAction(scheduleId: string, invoiceId: string) {
    const supabase = await createClient()

    // 1. Get schedule and client details for email BEFORE update (to ensure we have data)
    const { data: schedule, error: scheduleError } = await supabase
        .from('invoice_payment_schedules')
        .select(`
            *,
            invoice:invoices (
                id,
                currency,
                clients (
                    contact_email
                )
            )
        `)
        .eq('id', scheduleId)
        .single()

    if (scheduleError) {
        console.error('Schedule lookup error:', scheduleError);
        return { error: `Schedule not found: ${scheduleError.message}` }
    }

    if (!schedule) {
        return { error: 'Schedule not found' }
    }

    // 2. Update schedule status
    const { error: updateError } = await supabase
        .from('invoice_payment_schedules')
        .update({
            status: 'paid',
            paid_at: new Date().toISOString()
        })
        .eq('id', scheduleId)

    if (updateError) return { error: updateError.message }

    // 3. Insert payment history
    const { error: insertError } = await supabase
        .from('invoice_payments')
        .insert({
            invoice_id: invoiceId,
            amount: schedule.amount,
            payment_date: new Date().toISOString(),
            payment_method: 'bank_transfer',
            reference: schedule.qr_reference || `Installment ${schedule.installment_number}`,
            notes: `Manual confirmation for installment #${schedule.installment_number}`
        })

    if (insertError) console.error("Failed to record history:", insertError)

    // 4. Sync invoice total (re-using logic from original component, but server-side)
    const { data: payments } = await supabase
        .from('invoice_payments')
        .select('amount')
        .eq('invoice_id', invoiceId)

    const totalPaid = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const { data: invoice } = await supabase.from('invoices').select('amount').eq('id', invoiceId).single()

    await supabase.from('invoices').update({
        amount_paid: totalPaid,
        status: totalPaid >= (invoice?.amount || 0) ? 'paid' : 'partial'
    }).eq('id', invoiceId)


    // 5. Send Email to Client
    const clientEmail = schedule.invoice?.clients?.contact_email
    if (clientEmail) {
        await sendPaymentConfirmedEmail(clientEmail, {
            invoiceNumber: schedule.invoice.id.slice(0, 8).toUpperCase() || 'N/A',
            installmentNumber: schedule.installment_number,
            amount: schedule.amount.toFixed(2),
            currency: schedule.invoice.currency
        })
    }

    // 6. Log Activity
    const { logActivity } = await import('@/lib/activity');
    const { data: { user } } = await supabase.auth.getUser();
    await logActivity({
        userId: user?.id,
        action: 'install_payment_verified',
        entityType: 'payment_schedule',
        entityId: scheduleId,
        metadata: {
            amount: schedule.amount,
            invoiceId,
            method: 'manual_verification'
        }
    });

    // Notify Client
    const clientId = schedule.invoice?.clients?.user_id || schedule.invoice?.clients?.profile_id;
    // Note: confirmPaymentAction used 'clients (contact_email)' in select, I should check if I requested user_id. 
    // The select at top of function (L13) only asked for contact_email. I need user_id (profile_id in clients table).
    // Let's assume I can fetch it or trust the helper. 
    // Actually, I'll fetch it to be safe or rely on the fact that I can't easily change the top query in this replace chunk.
    // I will do a quick fetch.
    if (schedule.invoice?.clients) {
        const { data: clientData } = await supabase.from('clients').select('profile_id').eq('contact_email', schedule.invoice.clients.contact_email).single();
        if (clientData?.profile_id) {
            const { sendNotification } = await import('@/lib/notifications');
            await sendNotification({
                userId: clientData.profile_id,
                type: 'payment_confirmed',
                title: 'Payment Confirmed',
                message: `We received your payment of ${schedule.invoice.currency} ${schedule.amount.toFixed(2)}.`,
                link: `/invoices/${invoiceId}`
            });
        }
    }

    revalidatePath('/admin/invoices')
    return { success: true }
}


export async function createInvoiceAction(formData: FormData) {
    const supabase = await createClient()

    const clientId = formData.get('clientId') as string
    const projectId = formData.get('projectId') as string
    const amount = formData.get('amount') as string
    const description = formData.get('description') as string
    const dueDate = formData.get('dueDate') as string

    if (!clientId || !amount) {
        return { error: 'Client and Amount are required' }
    }

    const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
            client_id: clientId,
            project_id: projectId || null,
            amount: parseFloat(amount),
            description,
            status: 'pending',
            due_date: dueDate || null
        })
        .select('id')
        .single()

    if (error) {
        return { error: error.message }
    }

    if (invoice) {
        const { logActivity } = await import('@/lib/activity');
        const { data: { user } } = await supabase.auth.getUser();

        // Log Activity
        await logActivity({
            userId: user?.id,
            action: 'create_invoice',
            entityType: 'invoice',
            entityId: invoice.id,
            metadata: { amount, clientId }
        });

        // Notify Client
        const { data: client } = await supabase.from('clients').select('user_id').eq('id', clientId).single();
        if (client?.user_id) {
            const { sendNotification } = await import('@/lib/notifications');
            await sendNotification({
                userId: client.user_id,
                type: 'invoice_created',
                title: 'New Invoice Received',
                message: `Invoice for CHF ${amount} is now available.`,
                link: `/invoices/${invoice.id}`
            });
        }
    }

    revalidatePath('/admin/invoices')
    return { success: true }
}

export async function markInvoicePaidAction(formData: FormData) {
    const supabase = await createClient();
    const invoiceId = formData.get('invoiceId') as string;

    if (!invoiceId) return;

    await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId);

    revalidatePath('/admin/invoices');
}

export async function updateInvoiceAction(formData: FormData) {
    const supabase = await createClient()

    const id = formData.get('id') as string
    const clientId = formData.get('client_id') as string
    const projectId = formData.get('project_id') as string
    const amount = formData.get('amount') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string
    const dueDate = formData.get('due_date') as string

    if (!id || !clientId || !amount) {
        return { error: 'Invoice ID, Client, and Amount are required' }
    }

    const { error } = await supabase
        .from('invoices')
        .update({
            client_id: clientId,
            project_id: projectId || null,
            amount: parseFloat(amount),
            description: description || null,
            status,
            due_date: dueDate || null
        })
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/invoices')
    return { success: true }
}

export async function recordPaymentAction(formData: FormData) {
    const supabase = await createClient()

    const invoiceId = formData.get('invoice_id') as string
    const amount = parseFloat(formData.get('amount') as string)
    const paymentDate = formData.get('payment_date') as string
    const paymentMethod = formData.get('payment_method') as string
    const reference = formData.get('reference') as string
    const notes = formData.get('notes') as string
    const installmentNumber = formData.get('installment_number') as string

    if (!invoiceId || !amount) {
        return { error: 'Invoice ID and Amount are required' }
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Record the payment
    const { error } = await supabase
        .from('invoice_payments')
        .insert({
            invoice_id: invoiceId,
            amount: amount,
            payment_date: paymentDate || new Date().toISOString().split('T')[0],
            payment_method: paymentMethod || null,
            reference: reference || null,
            notes: notes || null,
            created_by: user?.id
        })

    if (error) {
        return { error: error.message }
    }

    // 2. If linked to an installment, update the schedule
    if (installmentNumber) {
        await supabase
            .from('invoice_payment_schedules')
            .update({
                status: 'paid',
                paid_at: new Date().toISOString()
            })
            .eq('invoice_id', invoiceId)
            .eq('installment_number', parseInt(installmentNumber))
    }

    // 2b. Log Activity
    const { logActivity } = await import('@/lib/activity');
    await logActivity({
        userId: user?.id,
        action: 'payment_received',
        entityType: 'invoice',
        entityId: invoiceId,
        metadata: { amount, method: paymentMethod, reference }
    });

    // 3. Update invoice amount_paid and status
    // Get all payments to calculate exact total paid
    const { data: payments } = await supabase
        .from('invoice_payments')
        .select('amount')
        .eq('invoice_id', invoiceId)

    const totalPaid = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    // Get original invoice amount
    const { data: invoice } = await supabase
        .from('invoices')
        .select('amount')
        .eq('id', invoiceId)
        .single()

    // Determine new status
    let newStatus = 'partial'
    if (totalPaid >= (invoice?.amount || 0)) {
        newStatus = 'paid'
    }

    // Update the invoice
    await supabase
        .from('invoices')
        .update({
            amount_paid: totalPaid,
            status: newStatus
        })
        .eq('id', invoiceId)

    revalidatePath('/admin/invoices')
    return { success: true }
}

export async function deletePaymentAction(paymentId: string) {
    const supabase = await createClient()

    if (!paymentId) {
        return { error: 'Payment ID is required' }
    }

    const { error } = await supabase
        .from('invoice_payments')
        .delete()
        .eq('id', paymentId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/invoices')
    return { success: true }
}

export async function updatePaymentAction(formData: FormData) {
    const supabase = await createClient()

    const paymentId = formData.get('payment_id') as string
    const invoiceId = formData.get('invoice_id') as string
    const amount = parseFloat(formData.get('amount') as string)
    const paymentDate = formData.get('payment_date') as string
    const paymentMethod = formData.get('payment_method') as string
    const reference = formData.get('reference') as string
    const notes = formData.get('notes') as string

    if (!paymentId || !invoiceId || !Number.isFinite(amount)) {
        return { error: 'Payment ID, Invoice ID, and Amount are required' }
    }

    const { error } = await supabase
        .from('invoice_payments')
        .update({
            amount,
            payment_date: paymentDate || null,
            payment_method: paymentMethod || null,
            reference: reference || null,
            notes: notes || null,
        })
        .eq('id', paymentId)
        .eq('invoice_id', invoiceId)

    if (error) {
        return { error: error.message }
    }

    // Re-sync invoice amount_paid + status based on payments (same logic as recordPaymentAction)
    const { data: payments } = await supabase
        .from('invoice_payments')
        .select('amount')
        .eq('invoice_id', invoiceId)

    const totalPaid = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    const { data: invoice } = await supabase
        .from('invoices')
        .select('amount')
        .eq('id', invoiceId)
        .single()

    let newStatus = 'partial'
    if (totalPaid <= 0) newStatus = 'pending'
    if (totalPaid >= (invoice?.amount || 0)) newStatus = 'paid'

    await supabase
        .from('invoices')
        .update({
            amount_paid: totalPaid,
            status: newStatus
        })
        .eq('id', invoiceId)

    revalidatePath('/admin/invoices')
    return { success: true }
}

export async function deleteInvoiceAction(invoiceId: string) {
    const supabase = await createClient()

    if (!invoiceId) {
        return { error: 'Invoice ID is required' }
    }

    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/invoices')
    return { success: true }
}
