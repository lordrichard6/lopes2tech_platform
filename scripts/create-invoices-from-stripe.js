/**
 * Manual script to create invoices from Stripe payments
 * Run this locally to backfill invoices for existing payments
 */

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

// Load .env.local
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

async function createInvoices() {
    console.log('🔄 Creating invoices from Stripe payments...\n');

    // Get subscription with Stripe ID
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*, services(name), clients(id, name)')
        .not('stripe_subscription_id', 'is', null);

    if (!subscriptions || subscriptions.length === 0) {
        console.log('❌ No Stripe-linked subscriptions found');
        return;
    }

    for (const sub of subscriptions) {
        console.log(`\n📦 Processing: ${sub.services?.name || 'Unknown'} (${sub.id})`);
        console.log(`   Stripe Subscription: ${sub.stripe_subscription_id}`);

        try {
            // Get all invoices from Stripe
            const stripeInvoices = await stripe.invoices.list({
                subscription: sub.stripe_subscription_id,
                limit: 100,
            });

            console.log(`   Found ${stripeInvoices.data.length} invoices in Stripe`);

            for (const stripeInv of stripeInvoices.data) {
                if (stripeInv.status !== 'paid') {
                    console.log(`   ⏭️  Skipping unpaid invoice: ${stripeInv.id}`);
                    continue;
                }

                // Check if invoice already exists
                const { data: existing } = await supabase
                    .from('invoices')
                    .select('id')
                    .eq('stripe_payment_intent_id', stripeInv.payment_intent)
                    .single();

                if (existing) {
                    console.log(`   ✅ Invoice already exists for ${stripeInv.payment_intent}`);
                    continue;
                }

                // Create invoice
                const { error } = await supabase
                    .from('invoices')
                    .insert({
                        client_id: sub.client_id,
                        amount: stripeInv.amount_paid / 100,
                        currency: stripeInv.currency.toUpperCase(),
                        status: 'paid',
                        description: `Subscription Renewal: ${sub.services?.name || 'Subscription'}`,
                        stripe_payment_intent_id: stripeInv.payment_intent,
                        due_date: new Date(stripeInv.created * 1000).toISOString().split('T')[0]
                    });

                if (error) {
                    console.error(`   ❌ Error:`, error.message);
                } else {
                    console.log(`   ✅ Created invoice: ${stripeInv.currency.toUpperCase()} ${(stripeInv.amount_paid / 100).toFixed(2)} - ${new Date(stripeInv.created * 1000).toLocaleDateString()}`);
                }
            }
        } catch (error) {
            console.error(`   ❌ Error:`, error.message);
        }
    }

    console.log('\n✅ Done!');
}

createInvoices();
