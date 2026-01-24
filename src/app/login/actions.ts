'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        redirect('/login?error=Invalid login credentials')
    }

    // Check user role to redirect appropriately
    const { data: { user } } = await supabase.auth.getUser()

    // Use server-only ADMIN_EMAIL (not exposed to client)
    const isAdmin = user?.user_metadata?.role === 'admin' || email === process.env.ADMIN_EMAIL

    revalidatePath('/', 'layout')

    if (isAdmin) {
        redirect('/admin')
    } else {
        redirect('/dashboard')
    }
}

