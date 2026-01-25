import { createClient } from "@/lib/supabase/server"
import { SettingsView } from "./settings-view"
import { revalidatePath } from "next/cache"

interface ClientProfile {
    name: string
    contact_email: string
    company_name: string | null
    phone: string | null
    street_address: string | null
    city: string | null
    postal_code: string | null
    country: string | null
    preferred_language: string | null
    secondary_email: string | null
    whatsapp_number: string | null
    timezone: string | null
    billing_street_address: string | null
    billing_city: string | null
    billing_postal_code: string | null
    billing_country: string | null
}

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let avatarUrl = ''
    let profile: ClientProfile = {
        name: '',
        contact_email: user?.email || '',
        company_name: null,
        phone: null,
        street_address: null,
        city: null,
        postal_code: null,
        country: null,
        preferred_language: null,
        secondary_email: null,
        whatsapp_number: null,
        timezone: null,
        billing_street_address: null,
        billing_city: null,
        billing_postal_code: null,
        billing_country: null,
    }

    if (user) {
        // Fetch Profile for Avatar
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single()

        avatarUrl = userProfile?.avatar_url || ''

        // Fetch Client Details
        const { data: client } = await supabase
            .from('clients')
            .select(`
                name, contact_email, company_name, phone, 
                street_address, city, postal_code, country, 
                preferred_language, secondary_email, whatsapp_number, timezone,
                billing_street_address, billing_city, billing_postal_code, billing_country
            `)
            .eq('profile_id', user.id)
            .single()

        if (client) {
            profile = {
                name: client.name || '',
                contact_email: client.contact_email || user?.email || '',
                company_name: client.company_name,
                phone: client.phone,
                street_address: client.street_address,
                city: client.city,
                postal_code: client.postal_code,
                country: client.country,
                preferred_language: client.preferred_language,
                secondary_email: client.secondary_email,
                whatsapp_number: client.whatsapp_number,
                timezone: client.timezone,
                billing_street_address: client.billing_street_address,
                billing_city: client.billing_city,
                billing_postal_code: client.billing_postal_code,
                billing_country: client.billing_country,
            }
        }
    }

    async function handleAvatarUpdate(newUrl: string) {
        'use server'
        revalidatePath('/dashboard/settings')
        revalidatePath('/dashboard')
    }

    return (
        <SettingsView
            user={user}
            avatarUrl={avatarUrl}
            profile={profile}
            onAvatarUpdate={handleAvatarUpdate}
        />
    )
}
