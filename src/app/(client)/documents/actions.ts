'use server'

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function uploadClientDocument(formData: FormData) {
    // Get form data
    const file = formData.get('file') as File
    const clientId = formData.get('client_id') as string
    const projectId = formData.get('project_id') as string | null
    const folderId = formData.get('folder_id') as string | null

    if (!file || !clientId) {
        throw new Error('Missing required fields')
    }

    // Verify the user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        throw new Error('Not authenticated')
    }

    // Use admin client for all operations
    const adminDb = createAdminClient()
    
    // Verify the client belongs to this user
    const { data: client } = await adminDb
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .eq('profile_id', user.id)
        .single()
    
    if (!client) {
        throw new Error('Unauthorized: Client not found or not owned by user')
    }

    // Generate file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${clientId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Convert File to Buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to storage using admin client (bypasses RLS)
    const { error: uploadError } = await adminDb.storage
        .from('client-documents')
        .upload(fileName, buffer, {
            contentType: file.type || 'application/octet-stream',
        })

    if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error('Failed to upload file')
    }

    // Insert document record using admin client (bypasses RLS)
    const { error: dbError } = await adminDb
        .from('documents')
        .insert({
            client_id: clientId,
            name: file.name,
            file_path: fileName,
            size: file.size,
            type: file.type || 'application/octet-stream',
            project_id: projectId || null,
            folder_id: folderId || null,
            is_visible_to_client: true, // Always true for client uploads
        })

    if (dbError) {
        console.error('Database insert error:', dbError)
        // Try to clean up the uploaded file
        await adminDb.storage.from('client-documents').remove([fileName])
        throw new Error('Failed to save document record')
    }

    revalidatePath('/documents')
    return { success: true }
}

// ============ FOLDER ACTIONS ============

export async function createFolder(data: {
    client_id: string;
    name: string;
    parent_id?: string | null;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        throw new Error('Not authenticated')
    }

    const adminDb = createAdminClient()
    
    // Verify client ownership
    const { data: client } = await adminDb
        .from('clients')
        .select('id')
        .eq('id', data.client_id)
        .eq('profile_id', user.id)
        .single()
    
    if (!client) {
        throw new Error('Unauthorized')
    }

    const { data: folder, error } = await adminDb
        .from('document_folders')
        .insert({
            client_id: data.client_id,
            name: data.name,
            parent_id: data.parent_id || null,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating folder:', error)
        throw new Error('Failed to create folder')
    }

    revalidatePath('/documents')
    return folder
}

export async function renameFolder(folderId: string, newName: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        throw new Error('Not authenticated')
    }

    const adminDb = createAdminClient()
    
    // Verify folder belongs to user's client
    const { data: folder } = await adminDb
        .from('document_folders')
        .select('id, client_id, clients!inner(profile_id)')
        .eq('id', folderId)
        .single()
    
    if (!folder || (folder.clients as any).profile_id !== user.id) {
        throw new Error('Unauthorized')
    }

    const { error } = await adminDb
        .from('document_folders')
        .update({ name: newName })
        .eq('id', folderId)

    if (error) {
        console.error('Error renaming folder:', error)
        throw new Error('Failed to rename folder')
    }

    revalidatePath('/documents')
}

export async function deleteFolder(folderId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        throw new Error('Not authenticated')
    }

    const adminDb = createAdminClient()
    
    // Verify folder belongs to user's client
    const { data: folder } = await adminDb
        .from('document_folders')
        .select('id, client_id, clients!inner(profile_id)')
        .eq('id', folderId)
        .single()
    
    if (!folder || (folder.clients as any).profile_id !== user.id) {
        throw new Error('Unauthorized')
    }

    // Move documents in this folder to root (null folder_id)
    await adminDb
        .from('documents')
        .update({ folder_id: null })
        .eq('folder_id', folderId)

    // Delete folder (cascade will delete subfolders)
    const { error } = await adminDb
        .from('document_folders')
        .delete()
        .eq('id', folderId)

    if (error) {
        console.error('Error deleting folder:', error)
        throw new Error('Failed to delete folder')
    }

    revalidatePath('/documents')
}

export async function moveDocumentToFolder(documentId: string, folderId: string | null) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        throw new Error('Not authenticated')
    }

    const adminDb = createAdminClient()
    
    // Verify document belongs to user's client
    const { data: doc } = await adminDb
        .from('documents')
        .select('id, client_id, clients!inner(profile_id)')
        .eq('id', documentId)
        .single()
    
    if (!doc || (doc.clients as any).profile_id !== user.id) {
        throw new Error('Unauthorized')
    }

    const { error } = await adminDb
        .from('documents')
        .update({ folder_id: folderId })
        .eq('id', documentId)

    if (error) {
        console.error('Error moving document:', error)
        throw new Error('Failed to move document')
    }

    revalidatePath('/documents')
}

export async function moveFolderToFolder(folderId: string, parentId: string | null) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        throw new Error('Not authenticated')
    }

    const adminDb = createAdminClient()
    
    // Verify folder belongs to user's client
    const { data: folder } = await adminDb
        .from('document_folders')
        .select('id, client_id, clients!inner(profile_id)')
        .eq('id', folderId)
        .single()
    
    if (!folder || (folder.clients as any).profile_id !== user.id) {
        throw new Error('Unauthorized')
    }

    // Prevent moving folder into itself or its children
    if (parentId === folderId) {
        throw new Error('Cannot move folder into itself')
    }

    const { error } = await adminDb
        .from('document_folders')
        .update({ parent_id: parentId })
        .eq('id', folderId)

    if (error) {
        console.error('Error moving folder:', error)
        throw new Error('Failed to move folder')
    }

    revalidatePath('/documents')
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
