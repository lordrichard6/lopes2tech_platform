'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendNotification } from '@/lib/notifications'
import { logActivity } from '@/lib/activity'

export async function updateTaskStatusAction(formData: FormData) {
    const supabase = await createClient()

    const taskId = formData.get('taskId') as string
    const status = formData.get('status') as string

    // Simple validation: Client can only Approve or Reject if it's currently Quoted
    // (We could enforce this more strictly with DB triggers or RLS, but app logic is fine for now)

    if (!taskId || !status || !['active', 'rejected'].includes(status)) {
        redirect(`/requests?error=Invalid action`)
    }

    // Fetch task details before updating (to get quote info and requester)
    const { data: task } = await supabase
        .from('tasks')
        .select('*, profiles!requester_id(full_name)')
        .eq('id', taskId)
        .single()

    if (!task) {
        redirect(`/requests/${taskId}?error=Task not found`)
    }

    // Update status
    const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId)

    if (error) {
        redirect(`/requests/${taskId}?error=${encodeURIComponent(error.message)}`)
    }

    // If approved (status = 'active'), notify admins
    if (status === 'active') {
        // Get admin profiles - use admin client to bypass RLS
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const adminSupabase = createAdminClient();
        
        const { data: admins, error: adminError } = await adminSupabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin');

        if (adminError) {
            console.error('Error fetching admins for notification:', adminError);
        }

        if (admins && admins.length > 0) {
            const requesterName = (task.profiles as any)?.full_name || 'Client'
            const quoteInfo = task.quote_amount 
                ? `${task.quote_currency} ${task.quote_amount.toFixed(2)}` 
                : 'approved'

            // Notify all admins
            const notificationResults = await Promise.all(admins.map(async (admin) => {
                const result = await sendNotification({
                    userId: admin.id,
                    type: 'quote_approved',
                    title: 'Quote Approved',
                    message: `${requesterName} approved the quote for "${task.title}" (${quoteInfo})`,
                    link: `/admin/inbox/${taskId}`
                });
                if (result?.error) {
                    console.error(`Failed to notify admin ${admin.id}:`, result.error);
                }
                return result;
            }));

            console.log(`Sent ${notificationResults.filter(r => r?.success).length} notifications to ${admins.length} admins`);
        } else {
            console.warn('No admin profiles found to notify');
        }

        // Log activity
        const { data: { user } } = await supabase.auth.getUser()
        await logActivity({
            userId: user?.id,
            action: 'quote_approved',
            entityType: 'task',
            entityId: taskId,
            metadata: {
                taskTitle: task.title,
                quoteAmount: task.quote_amount,
                quoteCurrency: task.quote_currency
            }
        })
    } else if (status === 'rejected') {
        // Log rejection activity
        const { data: { user } } = await supabase.auth.getUser()
        await logActivity({
            userId: user?.id,
            action: 'quote_rejected',
            entityType: 'task',
            entityId: taskId,
            metadata: {
                taskTitle: task.title
            }
        })
    }

    revalidatePath(`/requests/${taskId}`)
    revalidatePath(`/requests`)
    revalidatePath(`/admin/inbox`) // Also revalidate admin inbox to update counts
}
