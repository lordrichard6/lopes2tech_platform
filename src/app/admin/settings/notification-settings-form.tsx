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
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { updateSystemSettings } from "./actions"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    notify_new_client: z.boolean().default(false),
    notify_payment: z.boolean().default(false),
    notify_ticket: z.boolean().default(false),
})

interface NotificationSettingsFormProps {
    settings: {
        notify_new_client: boolean | null
        notify_payment: boolean | null
        notify_ticket: boolean | null
    }
}

export function NotificationSettingsForm({ settings }: NotificationSettingsFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            notify_new_client: settings.notify_new_client || false,
            notify_payment: settings.notify_payment || false,
            notify_ticket: settings.notify_ticket || false,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        const formData = new FormData()
        formData.append('notify_new_client', values.notify_new_client.toString())
        formData.append('notify_payment', values.notify_payment.toString())
        formData.append('notify_ticket', values.notify_ticket.toString())

        const result = await updateSystemSettings(formData)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Notification preferences updated")
        }
        setIsLoading(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="notify_new_client"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">New Clients</FormLabel>
                                <FormDescription>
                                    Receive an email when a new client registers.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="notify_payment"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Payments</FormLabel>
                                <FormDescription>
                                    Receive an email when an invoice is paid.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="notify_ticket"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Support Tickets</FormLabel>
                                <FormDescription>
                                    Receive emails for new support requests.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Preferences
                </Button>
            </form>
        </Form>
    )
}
