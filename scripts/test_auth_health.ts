
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to .env

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const password = 'password123'; // Assuming default or I can try to sign up if fails? 
// actually I don't know the password. I can't test login without password.
// But I can test *SignUp* or *MagicLink*?
// Or I can test public health endpoint?

if (!supabaseUrl || !anonKey || !email) {
    console.log('Missing vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function checkHealth() {
    console.log('Checking Auth Health...');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.log('Auth check (getSession) failed:', error.message);
    } else {
        console.log('Auth check (getSession) passed (no session is normal).');
    }

    // Try to get public config
    // @ts-ignore
    const { data: settings } = await supabase.from('system_settings').select('count', { count: 'exact', head: true });
    console.log('DB public access check:', settings === null ? 'Failed' : 'Success/Allowed');
}

checkHealth();
