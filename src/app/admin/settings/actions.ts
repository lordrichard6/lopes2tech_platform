'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateAdminProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const fullName = formData.get('full_name') as string

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/settings')
    return { success: 'Profile updated successfully' }
}

export async function updatePasswordAction(formData: FormData) {
    const supabase = await createClient()

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' }
    }

    if (password.length < 6) {
        return { error: 'Password must be at least 6 characters' }
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return { error: error.message }
    }

    return { success: 'Password updated successfully' }
}

export async function updateSystemSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Check admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    // Parse all potential settings
    const settings: any = {
        updated_at: new Date().toISOString(),
        updated_by: user.id
    }

    // Helper to safely add string fields
    const addString = (key: string) => {
        const val = formData.get(key)
        if (val !== null) settings[key] = val as string
    }

    // Helper to safely add boolean fields (checkboxes)
    const addBool = (key: string) => {
        if (formData.has(key)) {
            // If the field is present in formData, it might be 'on' or 'true' or 'false'
            // For checkboxes, usually presence means true if value is on, or we use hidden inputs.
            // We'll assume explicitly provided 'true'/'false' strings or handle 'on' as true if exclusively unchecked
            // But simpler: let's expect checkboxes to not send if unchecked, or use hidden inputs.
            // Actually, for form actions, it's safer to explicitly check for the key if using controlled inputs or "on".
            // Let's assume the client sends "true" or "false" strings for simplicity if controlled.
            const val = formData.get(key)
            settings[key] = val === 'true' || val === 'on'
        }
    }

    // Helper to add numeric
    const addNum = (key: string) => {
        const val = formData.get(key)
        if (val !== null) settings[key] = parseFloat(val as string)
    }

    addNum('default_tax_rate')
    addString('default_currency')
    addString('default_payment_terms')
    addString('default_footer_note')

    addBool('notify_new_client')
    addBool('notify_payment')
    addBool('notify_ticket')

    addBool('maintenance_mode')
    addBool('maintenance_mode')
    addBool('registration_open')

    // Bank Details
    addString('bank_name')
    addString('bank_address')
    addString('account_holder')
    addString('iban')
    addString('bic')
    addString('qr_iban')
    addString('qr_reference_type')

    // Creditor address for QR bills
    addString('creditor_street')
    addString('creditor_zip')
    addString('creditor_city')
    addString('creditor_country')

    // Find the single row ID or upsert
    const { data: existing } = await supabase.from('system_settings').select('id').single()

    let error;
    if (existing) {
        const { error: updateError } = await supabase
            .from('system_settings')
            .update(settings)
            .eq('id', existing.id)
        error = updateError
    } else {
        const { error: insertError } = await supabase
            .from('system_settings')
            .insert(settings)
        error = insertError
    }

    if (error) return { error: error.message }

    revalidatePath('/admin/settings')
    return { success: 'System settings updated' }
}

export async function getSystemSettings() {
    const supabase = await createClient()
    const { data } = await supabase.from('system_settings').select('*').single()
    return data
}
