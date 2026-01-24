'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

    const { error } = await supabase
        .from('invoices')
        .insert({
            client_id: clientId,
            project_id: projectId || null,
            amount: parseFloat(amount),
            description,
            status: 'pending',
            due_date: dueDate || null
        })

    if (error) {
        return { error: error.message }
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
