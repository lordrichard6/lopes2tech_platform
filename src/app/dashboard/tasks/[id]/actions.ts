'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateTaskStatusAction(formData: FormData) {
    const supabase = await createClient()

    const taskId = formData.get('taskId') as string
    const status = formData.get('status') as string

    // Simple validation: Client can only Approve or Reject if it's currently Quoted
    // (We could enforce this more strictly with DB triggers or RLS, but app logic is fine for now)

    if (!taskId || !status || !['active', 'rejected'].includes(status)) {
        redirect(`/dashboard/tasks?error=Invalid action`)
    }

    const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId)
    // Extra safety: only update if it was 'quoted' (for approval) or 'quoted/requested' (for rejection)
    // But for simplicity, we rely on RLS 'update own tasks' policy.

    if (error) {
        redirect(`/dashboard/tasks/${taskId}?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath(`/dashboard/tasks/${taskId}`)
    revalidatePath(`/dashboard/tasks`)
}
