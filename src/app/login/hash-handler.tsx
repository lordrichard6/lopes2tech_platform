'use client'

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export function LoginHashHandler() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Check if we have a hash in the URL (implicit flow)
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(
                async (event, session) => {
                    if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
                        // User verified via link
                        toast.success("Identity verified. Redirecting to password setup...")
                        router.push('/set-password')
                    }
                }
            )

            return () => {
                subscription.unsubscribe()
            }
        }
    }, [router, supabase])

    return null
}
