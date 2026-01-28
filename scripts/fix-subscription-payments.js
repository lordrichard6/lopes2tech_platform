/**
 * FIX SCRIPT: Link subscription to Stripe and create invoices from ALL payments
 * This handles the case where payments were made but subscription wasn't linked
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

async function fixPayments() {
    console.log('🔧 Fixing subscription payments...\n');

    // Step 1: Get subscription WITHOUT Stripe link
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*, services(name), clients(id, name, contact_email)')
        .is('stripe_subscription_id', null)
        .eq('status', 'active');

    if (!subscriptions || subscriptions.length === 0) {
        console.log('⚠️  No unlinked active subscriptions found');
        console.log('   Checking all subscriptions...\n');
        
        // Get all subscriptions
        const { data: allSubs } = await supabase
            .from('subscriptions')
            .select('*, services(name), clients(id, name, contact_email)');
        
        console.log(`Found ${allSubs?.length || 0} total subscriptions`);
        if (allSubs && allSubs.length > 0) {
            allSubs.forEach(sub => {
                console.log(`  - ${sub.services?.name || 'Unknown'}: ${sub.status} | Stripe ID: ${sub.stripe_subscription_id || 'NOT LINKED'}`);
            });
        }
        return;
    }

    console.log(`Found ${subscriptions.length} unlinked subscription(s)\n`);

    for (const sub of subscriptions) {
        console.log(`\n📦 Processing: ${sub.services?.name || 'Unknown'} (${sub.id})`);
        console.log(`   Client: ${sub.clients?.name || sub.client_id}`);
        console.log(`   Email: ${sub.clients?.contact_email || 'N/A'}`);

        if (!sub.clients?.contact_email) {
            console.log(`   ⚠️  No email - cannot search Stripe`);
            continue;
        }

        try {
            // Step 2: Find Stripe customer by email
            console.log(`   🔍 Searching Stripe for customer: ${sub.clients.contact_email}`);
            const customers = await stripe.customers.list({
                email: sub.clients.contact_email,
                limit: 10,
            });

            if (customers.data.length === 0) {
                console.log(`   ❌ No Stripe customer found for this email`);
                continue;
            }

            const customer = customers.data[0];
            console.log(`   ✅ Found Stripe customer: ${customer.id}`);

            // Step 3: Find subscriptions for this customer
            const stripeSubscriptions = await stripe.subscriptions.list({
                customer: customer.id,
                limit: 10,
            });

            if (stripeSubscriptions.data.length === 0) {
                console.log(`   ⚠️  No Stripe subscriptions found for this customer`);
                
                // Check payment intents instead
                console.log(`   🔍 Checking payment intents...`);
                const paymentIntents = await stripe.paymentIntents.list({
                    customer: customer.id,
                    limit: 100,
                });

                console.log(`   Found ${paymentIntents.data.length} payment intents`);
                
                // Create invoices from payment intents
                for (const pi of paymentIntents.data) {
                    if (pi.status !== 'succeeded') continue;

                    // Check if invoice already exists
                    const { data: existing } = await supabase
                        .from('invoices')
                        .select('id')
                        .eq('stripe_payment_intent_id', pi.id)
                        .single();

                    if (existing) {
                        console.log(`   ⏭️  Invoice already exists for ${pi.id}`);
                        continue;
                    }

                    // Create invoice
                    const { error } = await supabase
                        .from('invoices')
                        .insert({
                            client_id: sub.client_id,
                            amount: pi.amount / 100,
                            currency: pi.currency.toUpperCase(),
                            status: 'paid',
                            description: `Subscription Payment: ${sub.services?.name || 'Subscription'}`,
                            stripe_payment_intent_id: pi.id,
                            due_date: new Date(pi.created * 1000).toISOString().split('T')[0]
                        });

                    if (error) {
                        console.error(`   ❌ Error:`, error.message);
                    } else {
                        console.log(`   ✅ Created invoice: ${pi.currency.toUpperCase()} ${(pi.amount / 100).toFixed(2)}`);
                    }
                }
                continue;
            }

            const stripeSub = stripeSubscriptions.data[0];
            console.log(`   ✅ Found Stripe subscription: ${stripeSub.id}`);

            // Step 4: Link subscription
            const { error: linkError } = await supabase
                .from('subscriptions')
                .update({
                    stripe_subscription_id: stripeSub.id
                })
                .eq('id', sub.id);

            if (linkError) {
                console.error(`   ❌ Error linking:`, linkError.message);
                continue;
            }

            console.log(`   ✅ Linked subscription to Stripe`);

            // Update client with customer ID
            await supabase
                .from('clients')
                .update({ stripe_customer_id: customer.id })
                .eq('id', sub.client_id);

            // Step 5: Create invoices from Stripe subscription invoices
            console.log(`   📄 Creating invoices from Stripe...`);
            const stripeInvoices = await stripe.invoices.list({
                subscription: stripeSub.id,
                limit: 100,
            });

            console.log(`   Found ${stripeInvoices.data.length} invoices in Stripe`);

            for (const stripeInv of stripeInvoices.data) {
                if (stripeInv.status !== 'paid') continue;

                // Check if invoice already exists
                const { data: existing } = await supabase
                    .from('invoices')
                    .select('id')
                    .eq('stripe_payment_intent_id', stripeInv.payment_intent)
                    .single();

                if (existing) {
                    console.log(`   ⏭️  Invoice already exists`);
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

    console.log('\n✅ Done! Refresh the page to see payment logs.');
}

fixPayments();
