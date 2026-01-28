/**
 * Debug script to check subscription invoices in database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                process.env[key.trim()] = value;
            }
        });
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInvoices() {
    console.log('🔍 Checking subscription invoices in database...\n');

    // Get all clients
    const { data: clients } = await supabase
        .from('clients')
        .select('id, name, contact_email');

    console.log(`📋 Found ${clients?.length || 0} clients\n`);

    for (const client of clients || []) {
        console.log(`\n👤 Client: ${client.name} (${client.id})`);
        
        // Get subscriptions
        const { data: subscriptions } = await supabase
            .from('subscriptions')
            .select('*, services(name)')
            .eq('client_id', client.id);

        console.log(`   Subscriptions: ${subscriptions?.length || 0}`);

        for (const sub of subscriptions || []) {
            console.log(`\n   📦 Subscription: ${sub.services?.name || 'Unknown'} (${sub.id})`);
            console.log(`      Status: ${sub.status}`);
            console.log(`      Stripe ID: ${sub.stripe_subscription_id || 'NOT LINKED'}`);
            console.log(`      Service Name: ${sub.services?.name || 'N/A'}`);

            // Get ALL invoices for this client
            const { data: allInvoices } = await supabase
                .from('invoices')
                .select('*')
                .eq('client_id', client.id)
                .order('created_at', { ascending: false });

            console.log(`      Total invoices for client: ${allInvoices?.length || 0}`);

            // Get subscription renewal invoices
            const { data: subInvoices } = await supabase
                .from('invoices')
                .select('*')
                .eq('client_id', client.id)
                .like('description', 'Subscription Renewal:%')
                .eq('status', 'paid')
                .order('created_at', { ascending: false });

            console.log(`      Subscription renewal invoices: ${subInvoices?.length || 0}`);

            if (subInvoices && subInvoices.length > 0) {
                console.log(`      Invoice descriptions:`);
                subInvoices.forEach(inv => {
                    console.log(`         - ${inv.description} | ${inv.currency} ${inv.amount} | ${new Date(inv.created_at).toLocaleDateString()}`);
                });

                // Check matching
                const serviceName = sub.services?.name;
                if (serviceName) {
                    const matches = subInvoices.filter(inv => 
                        inv.description?.includes(`Subscription Renewal: ${serviceName}`)
                    );
                    console.log(`      ✅ Matches for "${serviceName}": ${matches.length}`);
                    if (matches.length === 0) {
                        console.log(`      ⚠️  NO MATCHES! Service name might not match invoice descriptions.`);
                        console.log(`      Looking for: "Subscription Renewal: ${serviceName}"`);
                    }
                }
            } else {
                console.log(`      ⚠️  NO SUBSCRIPTION INVOICES FOUND`);
            }
        }
    }

    console.log('\n✅ Check complete!');
}

checkInvoices();
