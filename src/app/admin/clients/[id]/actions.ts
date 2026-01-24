'use server'

import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'
import { getWelcomeEmailTemplate } from '@/lib/email-templates'

const enablePortalSchema = z.object({
    clientId: z.string().uuid(),
    email: z.string().email(),
    password: z.string().min(6)
})

export async function enablePortalAccessAction(formData: FormData) {
    try {
        await requireAdmin()

        const rawData = {
            clientId: formData.get('clientId'),
            email: formData.get('email'),
            password: formData.get('password')
        }

        const parseResult = enablePortalSchema.safeParse(rawData)
        if (!parseResult.success) {
            return { error: parseResult.error.issues[0].message }
        }

        const { clientId, email, password } = parseResult.data

        const adminSupabase = createAdminClient()

        // 1. Create Auth User
        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                role: 'client'
            }
        })

        if (authError) {
            return { error: `Auth Error: ${authError.message}` }
        }

        const userId = authData.user.id

        // 2. Link Client to User
        const { error: updateError } = await adminSupabase
            .from('clients')
            .update({
                profile_id: userId,
                contact_email: email
            })
            .eq('id', clientId)

        if (updateError) {
            return { error: `Database Error: ${updateError.message}` }
        }

        revalidatePath(`/admin/clients/${clientId}`)
        return { success: true }

    } catch (error: any) {
        return { error: error.message || "An unexpected error occurred" }
    }
}

const sendEmailSchema = z.object({
    clientId: z.string().uuid(),
    language: z.enum(['en', 'de', 'pt']).default('en')
})

export async function sendWelcomeEmailAction(formData: FormData) {
    try {
        await requireAdmin()

        const rawData = {
            clientId: formData.get('clientId'),
            language: formData.get('language')
        }

        const parseResult = sendEmailSchema.safeParse(rawData)
        if (!parseResult.success) {
            return { error: parseResult.error.issues[0].message }
        }

        const { clientId, language } = parseResult.data
        const adminSupabase = createAdminClient()

        // 1. Fetch Client Details
        const { data: client, error: clientError } = await adminSupabase
            .from('clients')
            .select('name, contact_email, profile_id')
            .eq('id', clientId)
            .single()

        if (clientError || !client) return { error: 'Client not found' }
        if (!client.contact_email) return { error: 'Client has no email' }
        if (!client.profile_id) return { error: 'Client has no active account' }

        // 2. Generate Temporary Password
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

        // 3. Update User Password
        const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
            client.profile_id,
            { password: tempPassword }
        )

        if (updateError) return { error: `Pwd Update Error: ${updateError.message}` }

        // 4. Send Email
        const { subject, html } = getWelcomeEmailTemplate(language as 'en' | 'de' | 'pt', {
            appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            email: client.contact_email,
            password: tempPassword,
            clientName: client.name
        })

        const emailResult = await sendEmail({
            to: client.contact_email,
            subject,
            html
        })

        if (!emailResult.success) {
            return { error: `Email Failed: ${emailResult.error}` }
        }

        return { success: true }

    } catch (error: any) {
        return { error: error.message || "An unexpected error occurred" }
    }
}


const addDocumentSchema = z.object({
    client_id: z.string().uuid(),
    name: z.string().min(1),
    file_path: z.string().min(1),
    size: z.number(),
    type: z.string(),
    is_visible_to_client: z.boolean()
})

export async function addDocumentRecord(data: z.infer<typeof addDocumentSchema>) {
    const { supabase } = await requireAdmin()

    // Validate input just in case (though types enforce it mostly)
    const result = addDocumentSchema.safeParse(data)
    if (!result.success) {
        throw new Error(result.error.issues[0].message)
    }

    const { client_id, name, file_path, size, type, is_visible_to_client } = result.data

    const { error } = await supabase
        .from('documents')
        .insert({
            client_id,
            name,
            file_path,
            size,
            type, // 'application/pdf', etc.
            is_visible_to_client
        })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath(`/admin/clients/${client_id}`)
}

export async function toggleDocumentVisibility(documentId: string, isVisible: boolean) {
    const { supabase } = await requireAdmin()

    const { error, data } = await supabase
        .from('documents')
        .update({ is_visible_to_client: isVisible })
        .eq('id', documentId)
        .select('client_id')
        .single()

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath(`/admin/clients/${data.client_id}`)
}

export async function deleteDocument(documentId: string, filePath: string) {
    const { supabase } = await requireAdmin()

    // 1. Delete from Storage
    const { error: storageError } = await supabase.storage
        .from('client-documents')
        .remove([filePath])

    if (storageError) {
        throw new Error(storageError.message)
    }

    // 2. Delete from Database
    const { error: dbError, data } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .select('client_id')
        .single()

    if (dbError) {
        throw new Error(dbError.message)
    }

    revalidatePath(`/admin/clients/${data.client_id}`)
}

export async function updateDocumentStatus(documentId: string, status: 'draft' | 'sent' | 'viewed' | 'signed') {
    const { supabase } = await requireAdmin()

    const updateData: Record<string, unknown> = { status }

    // Add timestamp based on status
    if (status === 'sent') {
        updateData.sent_at = new Date().toISOString()
    } else if (status === 'viewed') {
        updateData.viewed_at = new Date().toISOString()
    } else if (status === 'signed') {
        updateData.signed_at = new Date().toISOString()
    }

    const { error, data } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId)
        .select('client_id')
        .single()

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath(`/admin/clients/${data.client_id}`)
}

export async function sendDocumentToClient(documentId: string, clientEmail: string, documentName: string) {
    const { supabase } = await requireAdmin()

    try {
        // 1. Get document info and generate signed URL
        const { data: doc, error: docError } = await supabase
            .from('documents')
            .select('file_path, client_id')
            .eq('id', documentId)
            .single()

        if (docError || !doc) {
            return { success: false, error: 'Document not found' }
        }

        const { data: urlData, error: urlError } = await supabase.storage
            .from('client-documents')
            .createSignedUrl(doc.file_path, 60 * 60 * 24 * 7) // 7 days

        if (urlError || !urlData) {
            return { success: false, error: 'Could not generate download link' }
        }

        // 2. Send email with document link
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e293b;">New Document from Lopes2Tech</h2>
                <p>Hello,</p>
                <p>A new document has been shared with you: <strong>${documentName}</strong></p>
                <p>
                    <a href="${urlData.signedUrl}" 
                       style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                        Download Document
                    </a>
                </p>
                <p style="color: #64748b; font-size: 14px;">
                    This link expires in 7 days. You can also view all your documents in the 
                    <a href="${appUrl}/dashboard">client portal</a>.
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="color: #94a3b8; font-size: 12px;">
                    Lopes2Tech • Zurich, Switzerland • www.lopes2tech.ch
                </p>
            </div>
        `

        const emailResult = await sendEmail({
            to: clientEmail,
            subject: `New Document: ${documentName}`,
            html: emailHtml
        })

        if (!emailResult.success) {
            return { success: false, error: `Email failed: ${emailResult.error}` }
        }

        // 3. Update document status to 'sent'
        await updateDocumentStatus(documentId, 'sent')

        return { success: true }

    } catch (error: unknown) {
        const err = error as Error
        return { success: false, error: err.message || 'An unexpected error occurred' }
    }
}
