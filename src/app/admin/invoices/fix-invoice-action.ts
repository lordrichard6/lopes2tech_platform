'use server'

import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function fixInvoicePayment(invoiceId: string) {
    await requireAdmin();
    const supabase = createAdminClient();

    // Get invoice
    const { data: invoice } = await supabase
        .from('invoices')
        .select('id, amount, amount_paid, status, stripe_payment_intent_id, created_at')
        .eq('id', invoiceId)
        .single();

    if (!invoice) {
        throw new Error("Invoice not found");
    }

    // Check if payment record exists
    const { data: existingPayments } = await supabase
        .from('invoice_payments')
        .select('id')
        .eq('invoice_id', invoice.id);

    if (existingPayments && existingPayments.length > 0) {
        // Payment record exists, just update amount_paid
        const totalPaid = existingPayments.reduce((sum: number) => sum + invoice.amount, 0);
        await supabase
            .from('invoices')
            .update({
                amount_paid: invoice.amount,
                status: 'paid'
            })
            .eq('id', invoice.id);
        
        return { success: true, message: 'Updated amount_paid from existing payment records' };
    }

    // Create payment record
    const { error: paymentError } = await supabase
        .from('invoice_payments')
        .insert({
            invoice_id: invoice.id,
            amount: invoice.amount,
            payment_date: invoice.created_at ? invoice.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            payment_method: invoice.stripe_payment_intent_id ? 'stripe' : 'manual',
            reference: invoice.stripe_payment_intent_id || `Manual payment for invoice ${invoice.id.slice(0, 8)}`,
            notes: 'Payment record created to fix invoice'
        });

    if (paymentError) {
        throw new Error(`Error creating payment record: ${paymentError.message}`);
    }

    // Update invoice
    const { error: updateError } = await supabase
        .from('invoices')
        .update({
            amount_paid: invoice.amount,
            status: 'paid'
        })
        .eq('id', invoice.id);

    if (updateError) {
        throw new Error(`Error updating invoice: ${updateError.message}`);
    }

    return { success: true, message: 'Invoice payment record created and updated' };
}
