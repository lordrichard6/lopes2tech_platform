
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function fixAdmin() {
    console.log('Attemping to fix admin user (Direct Create)...')
    const email = 'admin@lopes2tech.ch'
    const password = 'admin123'

    // Skip list/delete steps as we handled cleanup via SQL
    // Proceed directly to creation

    console.log('Creating new admin user...')
    const { data, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: 'Paulo Lopes',
            role: 'admin'
        }
    })

    if (createError) {
        console.error('Create error:', createError)
        // If error is "user already registered", we assume success (since we just deleted it, this shouldn't happen unless race condition)
        return
    }

    if (data.user) {
        console.log('✅ Admin user created:', data.user.id)

        // Ensure profile role is admin
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', data.user.id)

        if (profileError) {
            console.error('Profile update error:', profileError)
        } else {
            console.log('✅ Profile role set to ADMIN')
        }
    }
}

fixAdmin()
