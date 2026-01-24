'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CreateProjectData {
    client_id: string
    name: string
    description?: string
    budget?: number
    start_date?: string
    deadline?: string
    service_ids: string[]
}

export async function createProjectAction(data: CreateProjectData) {
    const supabase = await createClient()

    // 1. Create Project
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
            client_id: data.client_id,
            name: data.name,
            description: data.description,
            budget: data.budget,
            start_date: data.start_date || new Date().toISOString().split('T')[0],
            deadline: data.deadline,
            status: 'active',
            progress: 0
        })
        .select()
        .single()

    if (projectError) {
        return { error: `Failed to create project: ${projectError.message}` }
    }

    // 2. Link Services (if any)
    if (data.service_ids && data.service_ids.length > 0) {
        const projectServices = data.service_ids.map(serviceId => ({
            project_id: project.id,
            service_id: serviceId
        }))

        const { error: servicesError } = await supabase
            .from('project_services')
            .insert(projectServices)

        if (servicesError) {
            // Optional: Delete project if service linking fails? 
            // For now, just return error but keep project. 
            // Or better, let's just log it and return success with warning.
            console.error('Failed to link services:', servicesError)
            return { success: 'Project created, but failed to link services.' }
        }
    }

    revalidatePath(`/admin/clients/${data.client_id}`)
    return { success: 'Project created successfully' }
}
