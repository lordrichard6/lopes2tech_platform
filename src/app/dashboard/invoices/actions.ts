'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPaymentProcessingEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

export async function markScheduleProcessingAction(scheduleId: string) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) return { error: 'Unauthorized' }

    // Use Admin Client to bypass RLS issues
    const adminDb = createAdminClient()

    // 1. Get schedule details (Simple query)
    const { data: schedule, error: scheduleError } = await adminDb
        .from('invoice_payment_schedules')
        .select('id, invoice_id, installment_number, amount, status')
        .eq('id', scheduleId)
        .single()

    if (scheduleError || !schedule) {
        console.error("Schedule Fetch Error:", scheduleError);
        return { error: 'Payment Schedule not found' }
    }

    // 2. Get Invoice details (Simple query)
    const { data: invoice, error: invoiceError } = await adminDb
        .from('invoices')
        .select('id, description, client_id, currency')
        .eq('id', schedule.invoice_id)
        .single()

    if (invoiceError || !invoice) {
        console.error("Invoice Fetch Error:", invoiceError);
        return { error: 'Linked Invoice not found' }
    }

    // 3. Get Client details (Simple query)
    const { data: client, error: clientError } = await adminDb
        .from('clients')
        .select('id, user_id, contact_email')
        .eq('id', invoice.client_id)
        .single()

    if (clientError || !client) {
        console.error("Client Fetch Error:", clientError);
        return { error: 'Client profile not found' }
    }

    // 4. Security Check: Ensure the user owns this invoice
    const isOwner = client.user_id === user.id ||
        (client.contact_email && client.contact_email.toLowerCase() === user.email?.toLowerCase())

    if (!isOwner) {
        return { error: 'Unauthorized Access to this Schedule' }
    }

    // 4. Update status
    const { error: updateError } = await adminDb
        .from('invoice_payment_schedules')
        .update({ status: 'processing' })
        .eq('id', scheduleId)

    if (updateError) return { error: updateError.message }

    // 5. Send Email to Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@lopes2tech.ch'

    try {
        await sendPaymentProcessingEmail(adminEmail, {
            invoiceNumber: invoice.description?.match(/INV-[\w-]+/)?.[0] || invoice.id.slice(0, 8),
            installmentNumber: schedule.installment_number,
            amount: schedule.amount.toFixed(2),
            currency: invoice.currency || 'CHF'
        })
    } catch (emailError) {
        console.error("Failed to send email:", emailError)
    }

    revalidatePath('/dashboard/invoices')
    return { success: true }
}
