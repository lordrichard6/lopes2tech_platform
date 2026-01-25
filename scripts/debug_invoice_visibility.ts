
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
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugInvoices() {
    console.log(`🔎 Debugging Invoice Visibility`);

    // 1. Get the profile of the user "ffa03253-a09f-4404-bbd4-e5a230aa2907" (The one we know is active/admin)
    // Actually, let's assume we are debugging for 'admin@lopes2tech.ch' or similar. 
    // I'll list all clients and their linked user_ids first.

    const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('id, name, contact_email, user_id, profile_id'); // Note: schema has 'profile_id' or 'user_id'? 
    // Migration says: profile_id uuid references public.profiles(id)
    // BUT 20260123120000_fix_client_invoice_rls.sql uses 'user_id' in update ?!
    // Wait. Let's check the columns of 'clients' table.

    if (clientError) console.error('Error fetching clients:', clientError);
    else {
        console.log(`\nClients Found: ${clients.length}`);
        clients.forEach(c => {
            console.log(`- [${c.name}] Email: ${c.contact_email} | ProfileID: ${c.profile_id} | UserID (if exists): ${c['user_id'] || 'N/A'}`);
        });
    }

    // 2. Count Invoices
    const { data: invoices } = await supabase.from('invoices').select('id, client_id, amount, status');
    console.log(`\nTotal Invoices: ${invoices?.length}`);
    invoices?.forEach(inv => {
        const client = clients?.find(c => c.id === inv.client_id);
        console.log(`- Invoice ${inv.id.slice(0, 8)} (${inv.amount}) -> Client: ${client?.name || 'Unknown'} (${inv.client_id})`);
    });

}

debugInvoices();
