'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addClientDocumentRecord(data: {
    client_id: string;
    name: string;
    file_path: string;
    size: number;
    type: string;
    project_id?: string;
}) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('documents')
        .insert({
            client_id: data.client_id,
            name: data.name,
            file_path: data.file_path,
            size: data.size,
            type: data.type,
            project_id: data.project_id || null,
            is_visible_to_client: true, // Always true for client uploads
        })

    if (error) {
        console.error('Error adding document record:', error)
        throw new Error('Failed to save document record')
    }

    revalidatePath('/dashboard/documents')
}

export async function getClientProjects(clientId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('client_id', clientId)
        .neq('status', 'completed') // Only active/pending/etc
        .order('name')

    if (error) {
        console.error('Error fetching projects:', error)
        return []
    }

    return data
}
