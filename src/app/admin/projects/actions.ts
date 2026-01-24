'use server'

import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProjectAction(formData: FormData) {
    const { supabase } = await requireAdmin()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const clientId = formData.get('clientId') as string

    if (!name || !clientId) redirect('/admin/projects?error=Name and Client are required')

    const { data: project, error } = await supabase
        .from('projects')
        .insert({
            name,
            description,
            client_id: clientId,
            status: 'active',
            progress: 0
        })
        .select()
        .single()

    if (error) {
        redirect(`/admin/projects?error=${encodeURIComponent(error.message)}`)
    }

    // Link Services
    const serviceIds = formData.getAll('service_ids') as string[]
    if (serviceIds.length > 0 && project) {
        const servicesToInsert = serviceIds.map(serviceId => ({
            project_id: project.id,
            service_id: serviceId
        }))

        const { error: servicesError } = await supabase
            .from('project_services')
            .insert(servicesToInsert)

        if (servicesError) {
            console.error('Failed to link services:', servicesError)
        }
    }

    revalidatePath('/admin/projects')
    redirect('/admin/projects')
}

