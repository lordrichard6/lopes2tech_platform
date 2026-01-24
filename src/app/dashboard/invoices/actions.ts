'use server'

import { createClient } from '@/lib/supabase/server'
import { sendPaymentProcessingEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

export async function markScheduleProcessingAction(scheduleId: string) {
    const supabase = await createClient()

    // 1. Get schedule details for email
    const { data: schedule } = await supabase
        .from('invoice_payment_schedules')
        .select(`
            *,
            invoice:invoices (
                invoice_number,
                currency
            )
        `)
        .eq('id', scheduleId)
        .single()

    if (!schedule) return { error: 'Schedule not found' }

    // 2. Update status
    const { error } = await supabase
        .from('invoice_payment_schedules')
        .update({ status: 'processing' })
        .eq('id', scheduleId)

    if (error) return { error: error.message }

    // 3. Send Email to Admin
    // Using fixed admin email or env var. For now assuming fixed as per task context.
    // 'admin@lopes2tech.ch' is the main admin.
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@lopes2tech.ch'

    await sendPaymentProcessingEmail(adminEmail, {
        invoiceNumber: schedule.invoice?.invoice_number || 'N/A',
        installmentNumber: schedule.installment_number,
        amount: schedule.amount.toFixed(2),
        currency: schedule.invoice?.currency || 'CHF'
    })

    revalidatePath('/dashboard/invoices')
    return { success: true }
}
