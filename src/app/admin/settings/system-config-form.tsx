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
    maintenance_mode: z.boolean().default(false),
    registration_open: z.boolean().default(false),
})

interface SystemConfigFormProps {
    settings: {
        maintenance_mode: boolean | null
        registration_open: boolean | null
    }
}

export function SystemConfigForm({ settings }: SystemConfigFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            maintenance_mode: settings.maintenance_mode || false,
            registration_open: settings.registration_open || false,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        const formData = new FormData()
        formData.append('maintenance_mode', values.maintenance_mode.toString())
        formData.append('registration_open', values.registration_open.toString())

        const result = await updateSystemSettings(formData)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("System configuration updated")
        }
        setIsLoading(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="maintenance_mode"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base text-red-500 font-semibold">Maintenance Mode</FormLabel>
                                <FormDescription>
                                    When enabled, client portal is inaccessible to non-admins.
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
                    name="registration_open"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Public Registration</FormLabel>
                                <FormDescription>
                                    Allow new users to sign up independently.
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

                <Button type="submit" variant="destructive" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update System Config
                </Button>
            </form>
        </Form>
    )
}
