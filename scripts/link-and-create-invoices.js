/**
 * Script to link subscriptions to Stripe and create invoices from payments
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

async function linkAndCreateInvoices() {
    console.log('🔄 Linking subscriptions and creating invoices...\n');

    // Get ALL subscriptions (including unlinked ones)
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*, services(name), clients(id, name, contact_email)')
        .eq('status', 'active');

    if (!subscriptions || subscriptions.length === 0) {
        console.log('❌ No active subscriptions found');
        return;
    }

    console.log(`📦 Found ${subscriptions.length} active subscription(s)\n`);

    for (const sub of subscriptions) {
        console.log(`\n📋 Processing: ${sub.services?.name || 'Unknown'} (${sub.id})`);
        console.log(`   Client: ${sub.clients?.name || sub.client_id}`);
        console.log(`   Email: ${sub.clients?.contact_email || 'N/A'}`);
        console.log(`   Current Stripe ID: ${sub.stripe_subscription_id || 'NOT LINKED'}`);

        // If not linked, try to find Stripe subscription by customer email
        if (!sub.stripe_subscription_id && sub.clients?.contact_email) {
            console.log(`   🔍 Searching for Stripe customer by email...`);
            
            try {
                // Search for customer by email
                const customers = await stripe.customers.list({
                    email: sub.clients.contact_email,
                    limit: 10,
                });

                if (customers.data.length > 0) {
                    const customer = customers.data[0];
                    console.log(`   ✅ Found Stripe customer: ${customer.id}`);

                    // Get subscriptions for this customer
                    const stripeSubscriptions = await stripe.subscriptions.list({
                        customer: customer.id,
                        limit: 10,
                    });

                    if (stripeSubscriptions.data.length > 0) {
                        const stripeSub = stripeSubscriptions.data[0];
                        console.log(`   ✅ Found Stripe subscription: ${stripeSub.id}`);

                        // Link subscription
                        const { error: linkError } = await supabase
                            .from('subscriptions')
                            .update({
                                stripe_subscription_id: stripeSub.id,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', sub.id);

                        if (linkError) {
                            console.error(`   ❌ Error linking:`, linkError.message);
                        } else {
                            console.log(`   ✅ Linked subscription to Stripe`);
                            sub.stripe_subscription_id = stripeSub.id;

                            // Update client with customer ID
                            await supabase
                                .from('clients')
                                .update({ stripe_customer_id: customer.id })
                                .eq('id', sub.client_id);
                        }
                    }
                }
            } catch (error) {
                console.error(`   ❌ Error searching Stripe:`, error.message);
            }
        }

        // Now create invoices from Stripe
        if (sub.stripe_subscription_id) {
            console.log(`   📄 Creating invoices from Stripe subscription...`);
            
            try {
                const stripeInvoices = await stripe.invoices.list({
                    subscription: sub.stripe_subscription_id,
                    limit: 100,
                });

                console.log(`   Found ${stripeInvoices.data.length} invoices in Stripe`);

                for (const stripeInv of stripeInvoices.data) {
                    if (stripeInv.status !== 'paid') {
                        continue;
                    }

                    // Check if invoice already exists
                    const { data: existing } = await supabase
                        .from('invoices')
                        .select('id')
                        .eq('stripe_payment_intent_id', stripeInv.payment_intent)
                        .single();

                    if (existing) {
                        console.log(`   ⏭️  Invoice already exists for payment ${stripeInv.payment_intent}`);
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
                        console.error(`   ❌ Error creating invoice:`, error.message);
                    } else {
                        console.log(`   ✅ Created invoice: ${stripeInv.currency.toUpperCase()} ${(stripeInv.amount_paid / 100).toFixed(2)} - ${new Date(stripeInv.created * 1000).toLocaleDateString()}`);
                    }
                }
            } catch (error) {
                console.error(`   ❌ Error fetching Stripe invoices:`, error.message);
            }
        } else {
            console.log(`   ⚠️  Subscription not linked to Stripe - cannot create invoices automatically`);
            console.log(`   💡 Tip: Make sure the subscription has a stripe_subscription_id`);
        }
    }

    console.log('\n✅ Done!');
}

linkAndCreateInvoices();
