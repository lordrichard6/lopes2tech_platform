
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

if (!supabaseUrl.includes('localhost') && !supabaseUrl.includes('127.0.0.1')) {
    console.error('Wrong environment. Local only.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceAdmin() {
    console.log(`Setting ALL profiles to Admin in: ${supabaseUrl}`);

    const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .neq('role', 'admin'); // Update those who are not admin

    if (error) {
        console.error('Error updating profiles:', error);
    } else {
        console.log('✅ All local profiles are now Admins.');
    }
}

forceAdmin();
