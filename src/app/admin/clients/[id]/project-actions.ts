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
    task_id?: string // Optional: link task to project
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
            console.error('Failed to link services:', servicesError)
            return { success: 'Project created, but failed to link services.' }
        }
    }

    // 3. Link task to project and notify client (if task_id provided)
    if (data.task_id && project) {
        // Fetch task to get requester_id and title
        const { data: task, error: taskFetchError } = await supabase
            .from('tasks')
            .select('requester_id, title')
            .eq('id', data.task_id)
            .single()

        if (taskFetchError) {
            console.error('Failed to fetch task:', taskFetchError)
        }

        // Link task to project
        const { error: taskLinkError } = await supabase
            .from('tasks')
            .update({ project_id: project.id })
            .eq('id', data.task_id)

        if (taskLinkError) {
            console.error('Failed to link task to project:', taskLinkError)
        }

        // Send notification to client (requester)
        if (task?.requester_id) {
            try {
                // Fetch client's preferred language for localization
                const { data: clientData } = await supabase
                    .from('clients')
                    .select('preferred_language')
                    .eq('profile_id', task.requester_id)
                    .single()

                const locale = (clientData?.preferred_language as 'en' | 'pt' | 'de') || 'en'
                
                // Import dictionaries for localized messages
                const { dictionaries } = await import('@/lib/i18n/dictionaries')
                const dict = dictionaries[locale]

                const title = dict.notifications?.projectCreatedTitle || 'Project Created'
                const message = dict.notifications?.projectCreatedMessage 
                    ? dict.notifications.projectCreatedMessage.replace('{title}', task.title)
                    : `Your request "${task.title}" has been converted into a project.`

                await sendNotification({
                    userId: task.requester_id,
                    type: 'project_created',
                    title,
                    message,
                    link: `/projects/${project.id}`
                })
            } catch (error) {
                console.error('Failed to send notification:', error)
            }
        }
    }

    revalidatePath(`/admin/clients/${data.client_id}`)
    revalidatePath('/admin/inbox')
    return { success: 'Project created successfully', projectId: project.id }
}
