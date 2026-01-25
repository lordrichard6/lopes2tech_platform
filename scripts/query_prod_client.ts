
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env explicitly to get production keys
const envConfig = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), '.env')));

const supabaseUrl = envConfig['NEXT_PUBLIC_SUPABASE_URL'] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig['SUPABASE_SERVICE_ROLE_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkClient() {
    console.log(`Checking client in DB: ${supabaseUrl}`);

    // Search for 'Ribeiro' in company_name or first_name/last_name
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .or('company_name.ilike.%Ribeiro%,first_name.ilike.%Ribeiro%,last_name.ilike.%Ribeiro%');

    if (error) {
        console.error('Error querying clients:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log(`Found ${data.length} client(s):`);
        console.log(JSON.stringify(data, null, 2));
    } else {
        console.log('No clients found matching "Ribeiro".');
    }
}

checkClient();
