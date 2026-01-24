'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { updateSystemSettings } from "./actions"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    default_tax_rate: z.coerce.number().min(0).max(100),
    default_currency: z.string().min(3).max(3),
    default_payment_terms: z.string().optional(),
    default_footer_note: z.string().optional(),
    bank_name: z.string().optional(),
    bank_address: z.string().optional(),
    account_holder: z.string().optional(),
    iban: z.string().optional(),
    bic: z.string().optional(),
    qr_iban: z.string().optional(),
    // Creditor address for QR bills
    creditor_street: z.string().optional(),
    creditor_zip: z.string().optional(),
    creditor_city: z.string().optional(),
    creditor_country: z.string().optional(),
})

interface InvoiceDefaultsSettings {
    default_tax_rate: number | null
    default_currency: string | null
    default_payment_terms: string | null
    default_footer_note: string | null
    bank_name: string | null
    bank_address: string | null
    account_holder: string | null
    iban: string | null
    bic: string | null
    qr_iban: string | null
    creditor_street: string | null
    creditor_zip: string | null
    creditor_city: string | null
    creditor_country: string | null
}

interface InvoiceDefaultsFormProps {
    settings: InvoiceDefaultsSettings
}

export function InvoiceDefaultsForm({ settings }: InvoiceDefaultsFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    // Ensure default values are safe strings/numbers
    const defaultValues: z.infer<typeof formSchema> = {
        default_tax_rate: settings.default_tax_rate ?? 8.1,
        default_currency: settings.default_currency || 'CHF',
        default_payment_terms: settings.default_payment_terms || 'Net 30',
        default_footer_note: settings.default_footer_note || '',
        bank_name: settings.bank_name || '',
        bank_address: settings.bank_address || '',
        account_holder: settings.account_holder || '',
        iban: settings.iban || '',
        bic: settings.bic || '',
        qr_iban: settings.qr_iban || '',
        creditor_street: settings.creditor_street || '',
        creditor_zip: settings.creditor_zip || '',
        creditor_city: settings.creditor_city || '',
        creditor_country: settings.creditor_country || 'CH',
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        const formData = new FormData()
        formData.append('default_tax_rate', values.default_tax_rate.toString())
        formData.append('default_currency', values.default_currency)
        if (values.default_payment_terms) formData.append('default_payment_terms', values.default_payment_terms)
        if (values.default_footer_note) formData.append('default_footer_note', values.default_footer_note)

        if (values.bank_name) formData.append('bank_name', values.bank_name)
        if (values.bank_address) formData.append('bank_address', values.bank_address)
        if (values.account_holder) formData.append('account_holder', values.account_holder)
        if (values.iban) formData.append('iban', values.iban)
        if (values.bic) formData.append('bic', values.bic)
        if (values.qr_iban) formData.append('qr_iban', values.qr_iban)
        if (values.creditor_street) formData.append('creditor_street', values.creditor_street)
        if (values.creditor_zip) formData.append('creditor_zip', values.creditor_zip)
        if (values.creditor_city) formData.append('creditor_city', values.creditor_city)
        if (values.creditor_country) formData.append('creditor_country', values.creditor_country)

        const result = await updateSystemSettings(formData)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Invoice defaults updated")
        }
        setIsLoading(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="default_tax_rate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Default Tax Rate (%)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="default_currency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="default_payment_terms"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payment Terms</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Net 30" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="default_footer_note"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Footer Note</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Thank you for your business..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Default text to appear at the bottom of invoices.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="border-t pt-4 mt-6">
                    <h3 className="text-lg font-medium mb-4">Bank Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="account_holder"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Holder</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bank_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bank Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="iban"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>IBAN</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bic"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>BIC / SWIFT</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="qr_iban"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>QR IBAN (Optional)</FormLabel>
                                    <FormControl><Input placeholder="For Swiss QR Bills" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Creditor Address for QR Bills */}
                <div className="border-t pt-4 mt-6">
                    <h3 className="text-lg font-medium mb-4">Creditor Address (for Swiss QR Bills)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="creditor_street"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Street & Number</FormLabel>
                                    <FormControl><Input placeholder="Musterstrasse 7" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="creditor_zip"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ZIP Code</FormLabel>
                                    <FormControl><Input placeholder="8000" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="creditor_city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl><Input placeholder="Zurich" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="creditor_country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl><Input placeholder="CH" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Defaults
                </Button>
            </form>
        </Form>
    )
}
