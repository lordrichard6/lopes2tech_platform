'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updatePasswordAction(password: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function updateClientProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const updates = {
        company_name: formData.get('company_name') as string || null,
        phone: formData.get('phone') as string || null,
        street_address: formData.get('street_address') as string || null,
        city: formData.get('city') as string || null,
        postal_code: formData.get('postal_code') as string || null,
        country: formData.get('country') as string || null,
        preferred_language: formData.get('preferred_language') as string || 'en',
        secondary_email: formData.get('secondary_email') as string || null,
        whatsapp_number: formData.get('whatsapp_number') as string || null,
        timezone: formData.get('timezone') as string || 'Europe/Zurich',
    }

    const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('profile_id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
}

export async function updateNotificationSettings(settings: {
    notify_project_updates: boolean
    notify_invoice_reminders: boolean
    notify_new_documents: boolean
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('clients')
        .update(settings)
        .eq('profile_id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
}

export async function updateBillingAddress(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const updates = {
        billing_street_address: formData.get('billing_street_address') as string || null,
        billing_city: formData.get('billing_city') as string || null,
        billing_postal_code: formData.get('billing_postal_code') as string || null,
        billing_country: formData.get('billing_country') as string || null,
    }

    const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('profile_id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
}
