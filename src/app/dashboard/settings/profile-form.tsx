'use client'

import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { updateClientProfile } from "./actions"
// import { ColorPaletteSelector } from "./color-palette-selector"

// Common timezones
const TIMEZONES = [
    { value: 'Europe/Zurich', label: 'Zurich (CET)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)' },
    { value: 'Europe/Lisbon', label: 'Lisbon (WET)' },
    { value: 'America/New_York', label: 'New York (EST)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
    { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
]

interface ProfileFormProps {
    profile: {
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
    }
}

export function ProfileForm({ profile }: ProfileFormProps) {
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        company_name: profile.company_name || '',
        phone: profile.phone || '',
        street_address: profile.street_address || '',
        city: profile.city || '',
        postal_code: profile.postal_code || '',
        country: profile.country || 'Switzerland',
        preferred_language: profile.preferred_language || 'en',
        secondary_email: profile.secondary_email || '',
        whatsapp_number: profile.whatsapp_number || '',
        timezone: profile.timezone || 'Europe/Zurich'
    })

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const form = new FormData()
        Object.entries(formData).forEach(([key, value]) => {
            form.append(key, value)
        })

        const result = await updateClientProfile(form)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Profile updated successfully!')
        }

        setSaving(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info - Read Only */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Full Name</Label>
                    <Input value={profile.name} disabled readOnly className="bg-muted" />
                </div>
                <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input value={profile.contact_email} disabled readOnly className="bg-muted" />
                </div>
            </div>

            {/* Editable Fields */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="company_name">Company</Label>
                    <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => handleChange('company_name', e.target.value)}
                        placeholder="Your company name"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+41 79 123 45 67"
                    />
                </div>
            </div>

            {/* Communication */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="secondary_email">Secondary Email</Label>
                    <Input
                        id="secondary_email"
                        type="email"
                        value={formData.secondary_email}
                        onChange={(e) => handleChange('secondary_email', e.target.value)}
                        placeholder="backup@example.com"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                    <Input
                        id="whatsapp_number"
                        value={formData.whatsapp_number}
                        onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                        placeholder="+41 79 123 45 67"
                    />
                </div>
            </div>

            <Separator />

            {/* Address Section */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="street_address">Street Address</Label>
                        <Input
                            id="street_address"
                            value={formData.street_address}
                            onChange={(e) => handleChange('street_address', e.target.value)}
                            placeholder="Bahnhofstrasse 1"
                        />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                placeholder="Zürich"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="postal_code">Postal Code</Label>
                            <Input
                                id="postal_code"
                                value={formData.postal_code}
                                onChange={(e) => handleChange('postal_code', e.target.value)}
                                placeholder="8001"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                value={formData.country}
                                onChange={(e) => handleChange('country', e.target.value)}
                                placeholder="Switzerland"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Preferences */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Preferences</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="preferred_language">Preferred Language</Label>
                        <Select
                            value={formData.preferred_language}
                            onValueChange={(value) => handleChange('preferred_language', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="de">Deutsch</SelectItem>
                                <SelectItem value="pt">Português</SelectItem>
                                <SelectItem value="fr">Français</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                            value={formData.timezone}
                            onValueChange={(value) => handleChange('timezone', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                {TIMEZONES.map(tz => (
                                    <SelectItem key={tz.value} value={tz.value}>
                                        {tz.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Theme Settings - Temporarily Disabled via User Request */}
            {/* <ColorPaletteSelector /> */}

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form >
    )
}
