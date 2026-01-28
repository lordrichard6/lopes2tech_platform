/**
 * Debug script to check ALL invoices in database
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
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                    process.env[key.trim()] = value;
                }
            }
        });
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment check:');
console.log('  SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('  SUPABASE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
console.log('');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugInvoices() {
    console.log('🔍 Checking ALL invoices in database...\n');

    // Get ALL invoices
    const { data: allInvoices, error: allError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    if (allError) {
        console.error('❌ Error fetching invoices:', allError);
        return;
    }

    console.log(`📋 Total invoices in database: ${allInvoices?.length || 0}\n`);

    if (allInvoices && allInvoices.length > 0) {
        console.log('All invoices:');
        allInvoices.forEach((inv, idx) => {
            console.log(`\n${idx + 1}. Invoice ${inv.id}`);
            console.log(`   Description: ${inv.description || 'N/A'}`);
            console.log(`   Amount: ${inv.currency || 'CHF'} ${inv.amount}`);
            console.log(`   Status: ${inv.status}`);
            console.log(`   Client ID: ${inv.client_id}`);
            console.log(`   Created: ${new Date(inv.created_at).toLocaleString()}`);
            console.log(`   Stripe Payment Intent: ${inv.stripe_payment_intent_id || 'N/A'}`);
        });

        // Check subscription renewal invoices
        const subInvoices = allInvoices.filter(inv => 
            inv.description?.includes('Subscription Renewal:')
        );
        console.log(`\n📦 Subscription renewal invoices: ${subInvoices.length}`);
    } else {
        console.log('⚠️  NO INVOICES FOUND IN DATABASE');
        console.log('This means invoices are not being created by the webhook.');
    }

    // Check subscriptions
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*, services(name), clients(id, name)')
        .limit(10);

    console.log(`\n📦 Total subscriptions: ${subscriptions?.length || 0}`);
    if (subscriptions && subscriptions.length > 0) {
        subscriptions.forEach(sub => {
            console.log(`\n   Subscription: ${sub.services?.name || 'Unknown'}`);
            console.log(`      ID: ${sub.id}`);
            console.log(`      Client: ${sub.clients?.name || sub.client_id}`);
            console.log(`      Stripe ID: ${sub.stripe_subscription_id || 'NOT LINKED'}`);
            console.log(`      Status: ${sub.status}`);
        });
    }

    console.log('\n✅ Debug complete!');
}

debugInvoices();
