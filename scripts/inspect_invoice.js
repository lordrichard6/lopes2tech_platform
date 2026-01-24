const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function inspectInvoice() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
            }
        });

        const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase credentials in .env.local');
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // CHECK ALL PROFILES
        console.log("=== ALL PROFILES ===");
        const { data: profiles, error: profErr } = await supabase
            .from('profiles')
            .select('id, full_name, role, username');

        if (profErr) console.error("Error fetching profiles:", profErr);
        else console.table(profiles);

    } catch (err) {
        console.error('Script error:', err);
    }
}

inspectInvoice();
