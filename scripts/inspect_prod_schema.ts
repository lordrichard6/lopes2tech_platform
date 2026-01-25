
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

if (!supabaseUrl || !supabaseKey) { process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log(`Inspecting 'activity_logs' table in: ${supabaseUrl}`);

    // Try to select one record to see structure, or just error content
    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error selecting:', error);
    } else if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
    } else {
        console.log('Table exists but is empty. Cannot infer columns easily via JS client without metadata access.');
        // Try inserting a dummy with just ID to fail and get column link? No.
        // Better: try to insert a minimal record and see if it works, or query information_schema if possible (usually not via JS client).
    }
}

inspectSchema();
