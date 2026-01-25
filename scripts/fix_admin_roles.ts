
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function parseEnv(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const env: Record<string, string> = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim();
        }
    });
    return env;
}

const envConfig = parseEnv(path.resolve(process.cwd(), '.env'));
const supabaseUrl = envConfig['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envConfig['SUPABASE_SERVICE_ROLE_KEY'];
const targetAdminEmail = envConfig['NEXT_PUBLIC_ADMIN_EMAIL']; // paulo@lopes2tech.ch

if (!supabaseUrl.includes('localhost') && !supabaseUrl.includes('127.0.0.1')) {
    console.error('SAFETY CHECK FAILED: This script is for LOCAL environment only.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRoles() {
    console.log(`🔧 Fixing Roles in: ${supabaseUrl}`);
    console.log(`Target Admin: ${targetAdminEmail}`);

    // 1. REVERT EVERYONE to 'client' (Safety Reset)
    console.log('1. Reverting ALL profiles to "client"...');
    const { error: resetError } = await supabase
        .from('profiles')
        .update({ role: 'client' })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Valid UUID

    if (resetError) {
        console.error('Error resetting roles:', resetError);
        return;
    }
    console.log('   -> Done.');

    // 2. Auth API and Profile Email lookup both failed. 
    // We will use the known User ID for 'paulo@lopes2tech.ch' observed in previous logs/checks.
    // ID: ffa03253-a09f-4404-bbd4-e5a230aa2907

    const targetUserId = 'ffa03253-a09f-4404-bbd4-e5a230aa2907';
    console.log(`2. Promoting Known Admin UUID: ${targetUserId}...`);

    const { error: promoteError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', targetUserId);

    if (promoteError) {
        console.error('Error promoting admin:', promoteError);
    } else {
        console.log('✅ Success: Roles corrected. Only User ffa03253... is Admin.');
    }
}

fixRoles();
