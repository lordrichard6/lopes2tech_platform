import { createClient } from "@/lib/supabase/server"
import { PasswordForm } from "./password-form"
import { ProfileForm } from "./profile-form"
import { BillingAddress } from "./billing-address"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { revalidatePath } from "next/cache"
import { Separator } from "@/components/ui/separator"

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
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            {/* Profile Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Your personal and business details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                        <div className="flex-shrink-0">
                            <AvatarUpload
                                uid={user?.id || ''}
                                url={avatarUrl}
                                onUploadComplete={handleAvatarUpdate}
                                size="lg"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <ProfileForm profile={profile} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
                <CardHeader>
                    <CardTitle>Billing Address</CardTitle>
                    <CardDescription>
                        Address used for invoices.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <BillingAddress
                        billingAddress={{
                            billing_street_address: profile.billing_street_address,
                            billing_city: profile.billing_city,
                            billing_postal_code: profile.billing_postal_code,
                            billing_country: profile.billing_country
                        }}
                        mainAddress={{
                            street_address: profile.street_address,
                            city: profile.city,
                            postal_code: profile.postal_code,
                            country: profile.country
                        }}
                    />
                </CardContent>
            </Card>

            {/* Security */}
            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PasswordForm />
                </CardContent>
            </Card>
        </div>
    )
}
