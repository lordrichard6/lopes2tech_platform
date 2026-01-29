'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { updateClientAction } from "../actions";

interface Client {
    id: string;
    name: string;
    company_name?: string | null;
    contact_email?: string | null;
    phone?: string | null;
    street_address?: string | null;
    city?: string | null;
    postal_code?: string | null;
    country?: string | null;
    billing_address?: string | null;
    billing_city?: string | null;
    billing_zip?: string | null;
    billing_country?: string | null;
    vat_id?: string | null;
    website?: string | null;
    status?: string | null;
    preferred_language?: string | null;
}

interface EditClientDialogProps {
    client: Client;
    children?: React.ReactNode;
}

const STATUS_OPTIONS = [
    { value: 'lead', label: 'Lead', description: 'New contact, exploring interest' },
    { value: 'qualified', label: 'Qualified', description: 'Qualified lead, showing interest' },
    { value: 'proposal', label: 'Proposal', description: 'Quote/proposal sent' },
    { value: 'client', label: 'Client', description: 'Active paying customer' },
    { value: 'vip', label: 'VIP', description: 'High-value, long-term client' },
    { value: 'inactive', label: 'Inactive', description: 'No active services' },
    { value: 'churned', label: 'Churned', description: 'Lost client' },
];

const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'German' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'fr', label: 'French' },
];

const COUNTRY_OPTIONS = [
    { value: 'CH', label: 'Switzerland' },
    { value: 'DE', label: 'Germany' },
    { value: 'AT', label: 'Austria' },
    { value: 'FR', label: 'France' },
    { value: 'IT', label: 'Italy' },
    { value: 'PT', label: 'Portugal' },
    { value: 'BR', label: 'Brazil' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
];

const BILLING_SAME_AS_MAIN = 'same-as-main';

export function EditClientDialog({ client, children }: EditClientDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: client.name || '',
        company_name: client.company_name || '',
        contact_email: client.contact_email || '',
        phone: client.phone || '',
        street_address: client.street_address || '',
        city: client.city || '',
        postal_code: client.postal_code || '',
        country: client.country || 'CH',
        billing_address: client.billing_address || '',
        billing_city: client.billing_city || '',
        billing_zip: client.billing_zip || '',
        billing_country: client.billing_country || '',
        vat_id: client.vat_id || '',
        website: client.website || '',
        status: client.status || 'lead',
        preferred_language: client.preferred_language || 'en',
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const result = await updateClientAction({
                id: client.id,
                ...formData,
            });

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success('Client updated successfully');
                setOpen(false);
            }
        } catch (error) {
            toast.error('Failed to update client');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Client
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Client</DialogTitle>
                    <DialogDescription>
                        Update client information. Changes are saved immediately.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="address">Address</TabsTrigger>
                        <TabsTrigger value="billing">Billing</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company_name">Company Name</Label>
                                <Input
                                    id="company_name"
                                    value={formData.company_name}
                                    onChange={(e) => handleChange('company_name', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact_email">Email</Label>
                                <Input
                                    id="contact_email"
                                    type="email"
                                    value={formData.contact_email}
                                    onChange={(e) => handleChange('contact_email', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    placeholder="+41 79 123 45 67"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    value={formData.website}
                                    onChange={(e) => handleChange('website', e.target.value)}
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="preferred_language">Preferred Language</Label>
                                <Select
                                    value={formData.preferred_language}
                                    onValueChange={(value) => handleChange('preferred_language', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LANGUAGE_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>

                    <TabsContent value="address" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="street_address">Street Address</Label>
                            <Input
                                id="street_address"
                                value={formData.street_address}
                                onChange={(e) => handleChange('street_address', e.target.value)}
                                placeholder="Bahnhofstrasse 1"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="postal_code">Postal Code</Label>
                                <Input
                                    id="postal_code"
                                    value={formData.postal_code}
                                    onChange={(e) => handleChange('postal_code', e.target.value)}
                                    placeholder="8001"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                    placeholder="Zurich"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Select
                                    value={formData.country}
                                    onValueChange={(value) => handleChange('country', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COUNTRY_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="billing" className="space-y-4 mt-4">
                        <p className="text-sm text-muted-foreground">
                            Leave blank to use the main address for billing.
                        </p>

                        <div className="space-y-2">
                            <Label htmlFor="billing_address">Billing Address</Label>
                            <Input
                                id="billing_address"
                                value={formData.billing_address}
                                onChange={(e) => handleChange('billing_address', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="billing_zip">Postal Code</Label>
                                <Input
                                    id="billing_zip"
                                    value={formData.billing_zip}
                                    onChange={(e) => handleChange('billing_zip', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="billing_city">City</Label>
                                <Input
                                    id="billing_city"
                                    value={formData.billing_city}
                                    onChange={(e) => handleChange('billing_city', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="billing_country">Country</Label>
                                <Select
                                    value={
                                        formData.billing_country && formData.billing_country.trim() !== ''
                                            ? formData.billing_country
                                            : BILLING_SAME_AS_MAIN
                                    }
                                    onValueChange={(value) =>
                                        handleChange(
                                            'billing_country',
                                            value === BILLING_SAME_AS_MAIN ? '' : value
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Same as main" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={BILLING_SAME_AS_MAIN}>Same as main</SelectItem>
                                        {COUNTRY_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vat_id">VAT ID</Label>
                            <Input
                                id="vat_id"
                                value={formData.vat_id}
                                onChange={(e) => handleChange('vat_id', e.target.value)}
                                placeholder="CHE-123.456.789"
                            />
                            <p className="text-xs text-muted-foreground">
                                Required for B2B invoicing in the EU/Switzerland.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading || !formData.name}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
