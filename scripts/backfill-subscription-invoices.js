/**
 * Script to backfill subscription invoices from Stripe payments
 * This creates invoice records for payments that were made but didn't create invoices
 */

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
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
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey || !stripeKey) {
    console.error('❌ Missing required environment variables');
    console.error('Need: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const stripe = new Stripe(stripeKey);

async function backfillInvoices() {
    console.log('🔄 Starting invoice backfill from Stripe...\n');

    try {
        // Get all subscriptions linked to Stripe
        const { data: subscriptions, error: subError } = await supabase
            .from('subscriptions')
            .select('*, services(name), clients(id, name)')
            .not('stripe_subscription_id', 'is', null);

        if (subError) {
            console.error('❌ Error fetching subscriptions:', subError);
            return;
        }

        console.log(`📦 Found ${subscriptions.length} Stripe-linked subscriptions\n`);

        for (const sub of subscriptions) {
            console.log(`\n📋 Processing subscription: ${sub.services?.name || 'Unknown'} (${sub.id})`);
            console.log(`   Stripe Subscription ID: ${sub.stripe_subscription_id}`);

            try {
                // Get all invoices for this subscription from Stripe
                const stripeInvoices = await stripe.invoices.list({
                    subscription: sub.stripe_subscription_id,
                    limit: 100,
                });

                console.log(`   Found ${stripeInvoices.data.length} invoices in Stripe`);

                for (const stripeInvoice of stripeInvoices.data) {
                    // Check if invoice already exists
                    const { data: existingInvoice } = await supabase
                        .from('invoices')
                        .select('id')
                        .eq('stripe_payment_intent_id', stripeInvoice.payment_intent)
                        .single();

                    if (existingInvoice) {
                        console.log(`   ⏭️  Invoice already exists for payment ${stripeInvoice.payment_intent}`);
                        continue;
                    }

                    // Create invoice record
                    if (stripeInvoice.status === 'paid' && stripeInvoice.amount_paid > 0) {
                        const { error: invError } = await supabase
                            .from('invoices')
                            .insert({
                                client_id: sub.client_id,
                                amount: stripeInvoice.amount_paid / 100,
                                currency: stripeInvoice.currency.toUpperCase(),
                                status: 'paid',
                                description: `Subscription Renewal: ${sub.services?.name || 'Subscription'}`,
                                stripe_payment_intent_id: stripeInvoice.payment_intent,
                                due_date: new Date(stripeInvoice.created * 1000).toISOString().split('T')[0]
                            });

                        if (invError) {
                            console.error(`   ❌ Error creating invoice:`, invError);
                        } else {
                            console.log(`   ✅ Created invoice for ${stripeInvoice.currency.toUpperCase()} ${(stripeInvoice.amount_paid / 100).toFixed(2)} (${new Date(stripeInvoice.created * 1000).toLocaleDateString()})`);
                        }
                    }
                }
            } catch (error) {
                console.error(`   ❌ Error processing subscription ${sub.id}:`, error.message);
            }
        }

        console.log('\n✅ Invoice backfill complete!');
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

backfillInvoices();
