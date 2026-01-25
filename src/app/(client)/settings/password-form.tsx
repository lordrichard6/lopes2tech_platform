'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { toast } from "sonner"
import { updatePasswordAction } from "./actions"
import { useRouter } from "next/navigation"

import { useLanguage } from "@/contexts/language-context"

// ... imports ... // Removed


export function PasswordForm() {
    const { t } = useLanguage()
    const router = useRouter()

    // Schema must be defined inside component or wrapped to access translations if we want flexible validation messages,
    // but typically Zod messages are harder to translate dynamically without complex setup.
    // For now, I will use static English checks or minimal translations. 
    // Wait, the Zod schema is outside. I should move it inside or pass messages?
    // Moving inside is easier for simple translation integration.

    const formSchema = z.object({
        password: z.string().min(6, {
            message: t.settings.securityForm.passwordMinLength,
        }),
        confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
        message: t.settings.securityForm.passwordMismatch,
        path: ["confirmPassword"],
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const result = await updatePasswordAction(values.password)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(t.settings.securityForm.success)
            form.reset()
            router.refresh()
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-md">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t.settings.securityForm.newPassword}</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormDescription>
                                {t.settings.securityForm.newPasswordDesc}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t.settings.securityForm.confirmPassword}</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">{t.settings.securityForm.updatePassword}</Button>
            </form>
        </Form>
    )
}
