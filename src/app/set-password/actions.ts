'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function setPasswordAction(password: string) {
    const supabase = await createClient()

    // 1. Update the password
    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return { error: error.message }
    }

    // 2. Sign out the user
    await supabase.auth.signOut()

    // 3. Redirect to login (redirect throws, so it must be last)
    redirect('/login?message=Password+set+successfully.+Please+log+in.')
}
