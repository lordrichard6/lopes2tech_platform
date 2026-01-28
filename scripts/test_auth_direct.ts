// Direct test of Supabase Auth to isolate the 500 error
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
    console.log('Testing Supabase Auth directly...')
    console.log('URL:', supabaseUrl)
    console.log('Key:', supabaseAnonKey.substring(0, 20) + '...')
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'admin@lopes2tech.ch',
            password: 'admin123'
        })
        
        if (error) {
            console.error('❌ Auth Error:', error)
            console.error('Status:', error.status)
            console.error('Code:', error.code)
            console.error('Message:', error.message)
            return
        }
        
        console.log('✅ Login successful!')
        console.log('User:', data.user?.email)
    } catch (err: any) {
        console.error('❌ Exception:', err)
        console.error('Stack:', err.stack)
    }
}

testAuth()
