import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SetPasswordForm } from "./set-password-form"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default async function SetPasswordPage() {
    const supabase = await createClient()

    // Ensure user is authenticated (via the magic link)
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        // If not authenticated, the link is invalid or expired
        redirect("/auth/auth-code-error")
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Set Your Password</CardTitle>
                    <CardDescription>
                        Please set a new password to activate your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SetPasswordForm />
                </CardContent>
            </Card>
        </div>
    )
}
