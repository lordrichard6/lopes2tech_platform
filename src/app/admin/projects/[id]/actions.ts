'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createMilestoneAction(formData: FormData) {
    const supabase = await createClient()

    const projectId = formData.get('projectId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const dueDate = formData.get('dueDate') as string
    const serviceId = formData.get('serviceId') as string // Optional

    if (!projectId || !title) {
        redirect(`/admin/projects/${projectId}?error=Title required`)
    }

    const { error } = await supabase
        .from('milestones')
        .insert({
            project_id: projectId,
            title,
            description,
            status: 'pending',
            due_date: dueDate || null,
            service_id: serviceId || null
        })

    if (error) {
        redirect(`/admin/projects/${projectId}?error=${encodeURIComponent(error.message)}`)
    }

    await updateProjectProgress(projectId)
    revalidatePath(`/admin/projects/${projectId}`)
}

export async function updateMilestoneStatusAction(formData: FormData) {
    const supabase = await createClient()

    const milestoneId = formData.get('milestoneId') as string
    const projectId = formData.get('projectId') as string
    const status = formData.get('status') as string

    if (!milestoneId || !status) return

    await supabase
        .from('milestones')
        .update({ status })
        .eq('id', milestoneId)

    await updateProjectProgress(projectId)
    revalidatePath(`/admin/projects/${projectId}`)
}

export async function updateProjectAction(formData: FormData) {
    const supabase = await createClient()

    const projectId = formData.get('id') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string
    const budget = formData.get('budget') ? parseFloat(formData.get('budget') as string) : null
    const start_date = formData.get('start_date') as string || null
    const deadline = formData.get('deadline') as string || null

    if (!projectId || !name) {
        return { error: 'Project ID and Name are required' }
    }

    const { error } = await supabase
        .from('projects')
        .update({
            name,
            description,
            status,
            budget,
            start_date,
            deadline
        })
        .eq('id', projectId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/projects/${projectId}`)
    return { success: true }
}

export async function deleteMilestoneAction(formData: FormData) {
    const supabase = await createClient()

    const milestoneId = formData.get('milestoneId') as string
    const projectId = formData.get('projectId') as string

    if (!milestoneId) return

    await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId)

    await updateProjectProgress(projectId)
    revalidatePath(`/admin/projects/${projectId}`)
}

export async function updateMilestoneDetailsAction(formData: FormData) {
    const supabase = await createClient()

    const milestoneId = formData.get('milestoneId') as string
    const projectId = formData.get('projectId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const dueDate = formData.get('dueDate') as string
    const serviceId = formData.get('serviceId') as string // Optional

    if (!milestoneId || !title) return

    await supabase
        .from('milestones')
        .update({
            title,
            description,
            due_date: dueDate || null,
            service_id: serviceId || null
        })
        .eq('id', milestoneId)

    revalidatePath(`/admin/projects/${projectId}`)
}

async function updateProjectProgress(projectId: string) {
    const supabase = await createClient()

    const { data: milestones } = await supabase
        .from('milestones')
        .select('status')
        .eq('project_id', projectId)

    if (!milestones || milestones.length === 0) {
        await supabase
            .from('projects')
            .update({ progress: 0 })
            .eq('id', projectId)
        return
    }

    const completed = milestones.filter(m => m.status === 'completed').length
    const progress = Math.round((completed / milestones.length) * 100)

    // If all milestones are completed (progress = 100%), automatically mark project as completed
    const updates: { progress: number; status?: string } = { progress }
    if (progress === 100) {
        updates.status = 'completed'
    }

    await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
}

export async function addServiceToProjectAction(projectId: string, serviceId: string) {
    const supabase = await createClient()

    // Check if already linked
    const { data: existing } = await supabase
        .from('project_services')
        .select('id')
        .eq('project_id', projectId)
        .eq('service_id', serviceId)
        .single()

    if (existing) {
        return { error: 'Service already linked to this project' }
    }

    const { error } = await supabase
        .from('project_services')
        .insert({
            project_id: projectId,
            service_id: serviceId
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/projects/${projectId}`)
    return { success: true }
}

export async function removeServiceFromProjectAction(projectId: string, serviceId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('project_services')
        .delete()
        .eq('project_id', projectId)
        .eq('service_id', serviceId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/projects/${projectId}`)
    return { success: true }
}

export async function deleteProjectAction(formData: FormData) {
    const supabase = await createClient()
    const projectId = formData.get('projectId') as string

    if (!projectId) return

    // Manually delete dependencies to ensure clean removal
    // Delete Milestones
    await supabase.from('milestones').delete().eq('project_id', projectId)

    // Delete Project Services
    await supabase.from('project_services').delete().eq('project_id', projectId)

    // Delete Project
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

    if (error) {
        return { error: error.message }
    }

    redirect('/admin/projects')
}

export async function createProjectInvoiceAction(data: {
    clientId: string,
    projectId: string,
    amount: number,
    currency: string,
    description: string,
    dueDate: string,
    invoiceNumber: string,
    items: any[]
}) {
    const supabase = await createClient()

    // 1) Create invoice with basic + metadata (net/gross = total for now, no tax)
    const issueDate = new Date().toISOString().split('T')[0];

    const { data: inserted, error } = await supabase
        .from('invoices')
        .insert({
            client_id: data.clientId,
            project_id: data.projectId,
            amount: data.amount,
            currency: data.currency,
            description: data.description,
            status: 'pending',
            due_date: data.dueDate,
            invoice_number: data.invoiceNumber,
            issue_date: issueDate,
            net_amount: data.amount,
            tax_amount: 0,
            gross_amount: data.amount
        })
        .select('id')
        .single()

    if (error || !inserted) {
        throw new Error(error?.message || 'Failed to create invoice');
    }

    const invoiceId = inserted.id as string;

    // 2) Persist invoice line items (matches current project invoice UI)
    const items = (data.items || []) as Array<{
        service_id?: string;
        name?: string;
        description?: string;
        quantity: number;
        price: number;
        unitLabel?: string;
        type?: string;
    }>;

    if (items.length > 0) {
        const invoiceItems = items.map((item, index) => {
            const quantity = Number(item.quantity) || 0;
            const unitPrice = Number(item.price) || 0;
            const subtotal = quantity * unitPrice;

            return {
                invoice_id: invoiceId,
                position: index + 1,
                type: item.type || (item.service_id ? 'service' : 'item'),
                name: item.name || 'Item',
                description: item.description || null,
                service_id: item.service_id || null,
                quantity,
                unit_label: item.unitLabel || null,
                unit_price: unitPrice,
                discount_percent: null,
                tax_rate_percent: null,
                line_subtotal: subtotal,
                line_discount_amount: null,
                line_tax_amount: 0,
                line_total: subtotal
            };
        });

        const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(invoiceItems);

        if (itemsError) {
            console.error('Failed to create invoice items:', itemsError);
            // Do not throw to avoid breaking invoice creation; items can be backfilled later.
        }
    }

    revalidatePath(`/admin/projects/${data.projectId}`)
}
