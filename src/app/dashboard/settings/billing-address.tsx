'use client'

import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { updateBillingAddress } from "./actions"

interface BillingAddressProps {
    billingAddress: {
        billing_street_address: string | null
        billing_city: string | null
        billing_postal_code: string | null
        billing_country: string | null
    }
    mainAddress: {
        street_address: string | null
        city: string | null
        postal_code: string | null
        country: string | null
    }
}

export function BillingAddress({ billingAddress, mainAddress }: BillingAddressProps) {
    const [saving, setSaving] = useState(false)
    const [sameAsMain, setSameAsMain] = useState(
        !billingAddress.billing_street_address &&
        !billingAddress.billing_city
    )
    const [formData, setFormData] = useState({
        billing_street_address: billingAddress.billing_street_address || '',
        billing_city: billingAddress.billing_city || '',
        billing_postal_code: billingAddress.billing_postal_code || '',
        billing_country: billingAddress.billing_country || 'Switzerland'
    })

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSameAsMain = (checked: boolean) => {
        setSameAsMain(checked)
        if (checked) {
            setFormData({
                billing_street_address: mainAddress.street_address || '',
                billing_city: mainAddress.city || '',
                billing_postal_code: mainAddress.postal_code || '',
                billing_country: mainAddress.country || 'Switzerland'
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const form = new FormData()
        if (sameAsMain) {
            // Clear billing address to indicate same as main
            form.append('billing_street_address', '')
            form.append('billing_city', '')
            form.append('billing_postal_code', '')
            form.append('billing_country', '')
        } else {
            Object.entries(formData).forEach(([key, value]) => {
                form.append(key, value)
            })
        }

        const result = await updateBillingAddress(form)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Billing address saved!')
        }
        setSaving(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="same-as-main"
                    checked={sameAsMain}
                    onCheckedChange={(checked) => handleSameAsMain(checked as boolean)}
                />
                <Label htmlFor="same-as-main" className="text-sm font-normal cursor-pointer">
                    Same as main address
                </Label>
            </div>

            {!sameAsMain && (
                <div className="space-y-4 pt-2">
                    <div className="grid gap-2">
                        <Label htmlFor="billing_street_address">Street Address</Label>
                        <Input
                            id="billing_street_address"
                            value={formData.billing_street_address}
                            onChange={(e) => handleChange('billing_street_address', e.target.value)}
                            placeholder="Billing street address"
                        />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="billing_city">City</Label>
                            <Input
                                id="billing_city"
                                value={formData.billing_city}
                                onChange={(e) => handleChange('billing_city', e.target.value)}
                                placeholder="City"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="billing_postal_code">Postal Code</Label>
                            <Input
                                id="billing_postal_code"
                                value={formData.billing_postal_code}
                                onChange={(e) => handleChange('billing_postal_code', e.target.value)}
                                placeholder="Postal code"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="billing_country">Country</Label>
                            <Input
                                id="billing_country"
                                value={formData.billing_country}
                                onChange={(e) => handleChange('billing_country', e.target.value)}
                                placeholder="Country"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving} size="sm" className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </form>
    )
}
