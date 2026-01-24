'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { updateAdminProfile } from "./actions"

const profileFormSchema = z.object({
    full_name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface AdminProfileFormProps {
    profile: {
        full_name: string | null
    }
}

export function AdminProfileForm({ profile }: AdminProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            full_name: profile.full_name || "",
        },
    })

    async function onSubmit(data: ProfileFormValues) {
        setIsLoading(true)

        const formData = new FormData()
        formData.append('full_name', data.full_name)

        const result = await updateAdminProfile(formData)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Profile updated successfully')
        }

        setIsLoading(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Profile"
                    )}
                </Button>
            </form>
        </Form>
    )
}
