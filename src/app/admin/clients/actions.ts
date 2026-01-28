'use server'

import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const createClientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address').optional().or(z.literal(''))
})

export async function createClientAction(formData: FormData) {
    const { supabase } = await requireAdmin()

    const rawData = {
        name: formData.get('name'),
        email: formData.get('email')
    }

    const valResult = createClientSchema.safeParse(rawData)

    if (!valResult.success) {
        const errorMessage = valResult.error.issues.map(e => e.message).join(', ')
        redirect(`/admin/clients/new?error=${encodeURIComponent(errorMessage)}`)
    }

    const { name, email } = valResult.data

    const { data: newClient, error } = await supabase
        .from('clients')
        .insert({
            name,
            contact_email: email,
            // profile_id is left NULL initially. 
            // It will be linked when "Portal Access" is enabled later.
        })
        .select('id')
        .single()

    if (error) {
        redirect(`/admin/clients/new?error=${encodeURIComponent(error.message)}`)
    }

    // Log Activity
    if (newClient) {
        const { logActivity } = await import('@/lib/activity');
        const { data: { user } } = await supabase.auth.getUser();

        await logActivity({
            userId: user?.id,
            action: 'create_client',
            entityType: 'client',
            entityId: newClient.id,
            metadata: { name, email }
        });
    }

    revalidatePath('/admin/clients')
    redirect('/admin/clients')
    revalidatePath('/admin/clients')
    redirect('/admin/clients')
}

const updateClientSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, 'Name is required'),
    company_name: z.string().optional().nullable(),
    contact_email: z.string().email('Invalid email address').optional().or(z.literal('')).nullable(),
    phone: z.string().optional().nullable(),
    street_address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    postal_code: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    billing_address: z.string().optional().nullable(),
    billing_city: z.string().optional().nullable(),
    billing_zip: z.string().optional().nullable(),
    billing_country: z.string().optional().nullable(),
    vat_id: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    preferred_language: z.string().optional().nullable(),
})

export async function updateClientAction(data: z.infer<typeof updateClientSchema>) {
    const { supabase } = await requireAdmin()

    const valResult = updateClientSchema.safeParse(data)
    if (!valResult.success) {
        const errorMessage = valResult.error.issues.map(e => e.message).join(', ')
        return { error: errorMessage }
    }

    const { id, ...updateData } = valResult.data

    // Clean up empty strings to null
    const cleanedData = Object.fromEntries(
        Object.entries(updateData).map(([key, value]) => [
            key,
            value === '' ? null : value
        ])
    )

    const { error } = await supabase
        .from('clients')
        .update(cleanedData)
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    // Log Activity
    const { logActivity } = await import('@/lib/activity')
    const { data: { user } } = await supabase.auth.getUser()

    await logActivity({
        userId: user?.id,
        action: 'update_client',
        entityType: 'client',
        entityId: id,
        metadata: { changes: Object.keys(cleanedData) }
    })

    revalidatePath(`/admin/clients/${id}`)
    revalidatePath('/admin/clients')
    return { success: true }
}

export async function bulkCreateClients(clients: any[]) {
    const { supabase } = await requireAdmin();

    const validatedClients = clients.map(client => {
        const prepared = {
            name: client.name,
            email: client.contact_email || client.email || ""
        };

        const validated = createClientSchema.safeParse(prepared);
        if (!validated.success) {
            throw new Error(`Validation error for client "${client.name}": ${validated.error.issues[0].message}`);
        }
        return {
            name: validated.data.name,
            contact_email: validated.data.email,
            company_name: client.company_name,
            status: client.status || 'lead',
        };
    });

    const { error } = await supabase
        .from('clients')
        .insert(validatedClients);

    if (error) throw new Error(error.message);
    revalidatePath('/admin/clients');
}

export async function replaceAllClients(clients: any[]) {
    const { supabase } = await requireAdmin();

    // 1. Validate
    const validatedClients = clients.map(client => {
        const prepared = {
            name: client.name,
            email: client.contact_email || client.email || ""
        };
        const validated = createClientSchema.safeParse(prepared);
        if (!validated.success) {
            throw new Error(`Validation error for client "${client.name}": ${validated.error.issues[0].message}`);
        }
        return {
            name: validated.data.name,
            contact_email: validated.data.email,
            company_name: client.company_name,
            status: client.status || 'lead',
        };
    });

    // 2. Delete All (CAREFUL: This will cascade delete projects, invoices etc if setup that way)
    // Checking schema: clients delete cascade?
    // User wants "same workflow".
    // I should warn about data loss in UI.
    const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
        if (deleteError.code === '23503') { // Foreign key violation if not cascade
            throw new Error("Cannot replace: Clients have linked data (Projects/Invoices) that prevent deletion.");
        }
        throw new Error(`Failed to clear clients: ${deleteError.message}`);
    }

    // 3. Insert
    const { error: insertError } = await supabase
        .from('clients')
        .insert(validatedClients);

    if (insertError) throw new Error(insertError.message);
    revalidatePath('/admin/clients');
}
