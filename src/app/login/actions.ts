'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

// ... imports

function isRedirectError(error: any) {
    return error?.message === 'NEXT_REDIRECT' || error?.digest === 'NEXT_REDIRECT';
}

// Define return type
type LoginState = {
    error?: string;
    message?: string;
} | undefined;

export async function login(prevState: LoginState, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Login action error:', error);
            return { error: 'Invalid login credentials' }
        }

        console.log('Login successful for:', email);

        // Check user role to redirect appropriately
        const { data: { user } } = await supabase.auth.getUser()

        console.log('User metadata:', user?.user_metadata);
        console.log('Admin Email Env:', process.env.ADMIN_EMAIL);

        // Use server-only ADMIN_EMAIL (not exposed to client)
        const isAdmin = user?.user_metadata?.role === 'admin' || email === process.env.ADMIN_EMAIL

        if (user) {
            const { logActivity } = await import('@/lib/activity');
            await logActivity({
                userId: user.id,
                action: 'login',
                entityType: 'user',
                entityId: user.id,
                metadata: {
                    role: user.user_metadata?.role || 'client',
                    email: user.email
                }
            });
        }

        revalidatePath('/', 'layout')

        if (isAdmin) {
            redirect('/admin')
        } else {
            redirect('/dashboard')
        }
    } catch (error) {
        if (isRedirectError(error)) throw error
        console.error('Login error:', error)
        return { error: 'An unexpected error occurred. Please try again.' }
    }
}

