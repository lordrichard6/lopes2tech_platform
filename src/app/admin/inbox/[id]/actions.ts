'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function sendQuoteAction(formData: FormData) {
    const supabase = await createClient()

    const taskId = formData.get('taskId') as string
    const amount = formData.get('amount') as string
    const currency = formData.get('currency') as string

    if (!taskId || !amount) {
        redirect(`/admin/inbox/${taskId}?error=Amount required`)
    }

    const { error } = await supabase
        .from('tasks')
        .update({
            status: 'quoted',
            quote_amount: parseFloat(amount),
            quote_currency: currency || 'CHF'
        })
        .eq('id', taskId)

    if (error) {
        redirect(`/admin/inbox/${taskId}?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath(`/admin/inbox/${taskId}`)
    revalidatePath(`/admin/inbox`)
    redirect('/admin/inbox')
}

export async function rejectRequestAction(formData: FormData) {
    const supabase = await createClient()

    const taskId = formData.get('taskId') as string

    if (!taskId) return

    const { error } = await supabase
        .from('tasks')
        .update({ status: 'rejected' })
        .eq('id', taskId)

    if (error) {
        redirect(`/admin/inbox/${taskId}?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath(`/admin/inbox/${taskId}`)
    revalidatePath(`/admin/inbox`)
    redirect('/admin/inbox')
}

export async function deleteTaskAction(formData: FormData) {
    "use server";
    const createAdminClient = (await import("@/lib/supabase/admin")).createAdminClient;
    const taskId = formData.get("taskId") as string;
    const supabase = createAdminClient();

    const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

    if (error) {
        console.error("Error deleting task:", error);
        throw new Error("Failed to delete task");
    }

    revalidatePath("/admin/inbox");
    redirect("/admin/inbox");
}
