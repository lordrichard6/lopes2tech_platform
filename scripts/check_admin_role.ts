
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
    console.error('Wrong environment. Check only for local.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
    console.log(`Checking profiles in: ${supabaseUrl}`);

    // 1. Get all profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error('Error fetching profiles:', error);
    } else {
        console.log(`Total Profiles Found: ${profiles?.length || 0}`);
        profiles?.forEach(p => {
            console.log(`- User ID: ${p.id} | Email: ${p.email} | Role: ${p.role}`);
        });
    }

    // 2. Auth user list failed locally (Supabase issue?), but profiles are the source of RLS role truth.
    console.log('\n--- End of Profiles ---');
}

checkProfiles();
