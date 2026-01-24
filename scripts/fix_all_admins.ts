
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = envContent.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=')
    if (key && value) {
        acc[key.trim()] = value.trim()
    }
    return acc
}, {} as Record<string, string>)

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL']
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const ADMIN_ID = 'ffa03253-a09f-4404-bbd4-e5a230aa2907'; // Paulo Lopes

async function fixRoles() {
    console.log(`Preserving Admin: ${ADMIN_ID}`);

    const { error, count } = await supabase
        .from('profiles')
        .update({ role: 'client' })
        .neq('id', ADMIN_ID)
        .eq('role', 'admin') // Only update those who are currently mistaken admins
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error updating roles:', error);
    } else {
        console.log(`Successfully demoted ${count} users to 'client' role.`);
    }
}

fixRoles()
