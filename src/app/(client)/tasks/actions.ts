'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTaskAction(formData: FormData) {
    const supabase = await createClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const priority = formData.get('priority') as string

    if (!title) redirect('/dashboard/tasks/new?error=Title is required')

    const { error } = await supabase
        .from('tasks')
        .insert({
            requester_id: user.id,
            title,
            description,
            priority: priority || 'medium',
            status: 'requested'
        })

    if (error) {
        redirect(`/dashboard/tasks/new?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/dashboard/tasks')
    redirect('/dashboard/tasks')
}
