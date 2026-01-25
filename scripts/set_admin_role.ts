
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
const targetEmail = envConfig['NEXT_PUBLIC_ADMIN_EMAIL']; // paulo@lopes2tech.ch

if (!supabaseUrl.includes('localhost') && !supabaseUrl.includes('127.0.0.1')) {
    console.error('Wrong environment. Local only.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function promoteAdmin() {
    console.log(`Promoting ${targetEmail} to Admin in: ${supabaseUrl}`);

    // 1. Find User by Email (requires listing users via admin api)
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email === targetEmail);

    if (!user) {
        console.error(`User with email ${targetEmail} not found in Auth!`);
        console.log('Available emails:', users.map(u => u.email));
        return;
    }

    console.log(`Found User: ${user.id}`);

    // 2. Update Profile Role
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);

    if (updateError) {
        console.error('Error updating profile:', updateError);
    } else {
        console.log('✅ Success! User is now Admin.');
    }
}

promoteAdmin();
