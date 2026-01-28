/**
 * Find ALL subscriptions and check their status
 */

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
        fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                }
            }
        });
    }
}

loadEnv();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function findAll() {
    console.log('🔍 Finding ALL subscriptions...\n');

    // Get ALL subscriptions (no filter)
    const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*, services(name), clients(id, name, contact_email)');

    if (error) {
        console.error('❌ Error:', error);
        return;
    }

    console.log(`📦 Found ${subscriptions?.length || 0} total subscription(s)\n`);

    if (!subscriptions || subscriptions.length === 0) {
        console.log('⚠️  No subscriptions in database at all!');
        return;
    }

    for (const sub of subscriptions) {
        console.log(`\n📋 Subscription ID: ${sub.id}`);
        console.log(`   Service: ${sub.services?.name || 'N/A'}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Client: ${sub.clients?.name || sub.client_id}`);
        console.log(`   Email: ${sub.clients?.contact_email || 'N/A'}`);
        console.log(`   Stripe Subscription ID: ${sub.stripe_subscription_id || 'NOT LINKED'}`);
        console.log(`   Amount: CHF ${sub.amount}`);
        console.log(`   Start Date: ${sub.start_date || 'N/A'}`);

        // Check invoices for this client
        const { data: invoices } = await supabase
            .from('invoices')
            .select('*')
            .eq('client_id', sub.client_id)
            .order('created_at', { ascending: false })
            .limit(10);

        console.log(`   Invoices for client: ${invoices?.length || 0}`);
        if (invoices && invoices.length > 0) {
            invoices.forEach(inv => {
                console.log(`      - ${inv.description || 'N/A'} | ${inv.currency} ${inv.amount} | ${inv.status} | ${new Date(inv.created_at).toLocaleDateString()}`);
            });
        }

        // If linked to Stripe, check Stripe invoices
        if (sub.stripe_subscription_id) {
            try {
                const stripeInvoices = await stripe.invoices.list({
                    subscription: sub.stripe_subscription_id,
                    limit: 10,
                });
                console.log(`   Stripe invoices: ${stripeInvoices.data.length}`);
                stripeInvoices.data.forEach(inv => {
                    console.log(`      - ${inv.id} | ${inv.currency.toUpperCase()} ${(inv.amount_paid / 100).toFixed(2)} | ${inv.status} | ${new Date(inv.created * 1000).toLocaleDateString()}`);
                });
            } catch (err) {
                console.log(`   ⚠️  Error fetching Stripe invoices: ${err.message}`);
            }
        }
    }

    console.log('\n✅ Check complete!');
}

findAll();
