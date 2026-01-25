
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
    console.error('Wrong environment. Logs check only for local.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
    console.log(`Checking logs in: ${supabaseUrl}`);

    const { data, count, error } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Total Activity Logs Found: ${count}`);
        if (data && data.length > 0) {
            console.log('Most recent logs:');
            data.slice(0, 3).forEach(log => {
                console.log(`- [${log.action}] on ${log.entity_type} (ID: ${log.entity_id})`);
            });
        }
    }
}

checkLogs();
