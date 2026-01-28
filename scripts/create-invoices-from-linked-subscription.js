/**
 * Create invoices from a linked Stripe subscription
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

async function createInvoices() {
    console.log('📄 Creating invoices from Stripe subscription...\n');

    // Get subscription with Stripe ID
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*, services(name), clients(id, name)')
        .not('stripe_subscription_id', 'is', null);

    if (!subscriptions || subscriptions.length === 0) {
        console.log('❌ No Stripe-linked subscriptions found');
        console.log('\nTrying to find subscription by email...\n');
        
        // Try finding by email
        const { data: allSubs } = await supabase
            .from('subscriptions')
            .select('*, services(name), clients(id, name, contact_email)')
            .limit(10);
        
        if (allSubs && allSubs.length > 0) {
            console.log(`Found ${allSubs.length} subscription(s):`);
            for (const sub of allSubs) {
                console.log(`\n  Subscription: ${sub.services?.name || 'Unknown'}`);
                console.log(`    ID: ${sub.id}`);
                console.log(`    Stripe ID: ${sub.stripe_subscription_id || 'NOT LINKED'}`);
                console.log(`    Client Email: ${sub.clients?.contact_email || 'N/A'}`);
                
                if (!sub.stripe_subscription_id && sub.clients?.contact_email) {
                    try {
                        const customers = await stripe.customers.list({
                            email: sub.clients.contact_email,
                            limit: 1
                        });
                        
                        if (customers.data.length > 0) {
                            const customer = customers.data[0];
                            const stripeSubs = await stripe.subscriptions.list({
                                customer: customer.id,
                                limit: 1
                            });
                            
                            if (stripeSubs.data.length > 0) {
                                const stripeSub = stripeSubs.data[0];
                                console.log(`    ✅ Found Stripe subscription: ${stripeSub.id}`);
                                
                                // Link it
                                await supabase
                                    .from('subscriptions')
                                    .update({ stripe_subscription_id: stripeSub.id })
                                    .eq('id', sub.id);
                                
                                console.log(`    ✅ Linked!`);
                                
                                // Now create invoices
                                const invoices = await stripe.invoices.list({
                                    subscription: stripeSub.id,
                                    limit: 100
                                });
                                
                                console.log(`    📄 Found ${invoices.data.length} invoices in Stripe`);
                                
                                for (const inv of invoices.data) {
                                    if (inv.status !== 'paid') continue;
                                    
                                    const { data: existing } = await supabase
                                        .from('invoices')
                                        .select('id')
                                        .eq('stripe_payment_intent_id', inv.payment_intent)
                                        .single();
                                    
                                    if (existing) {
                                        console.log(`      ⏭️  Invoice exists`);
                                        continue;
                                    }
                                    
                                    const { error } = await supabase
                                        .from('invoices')
                                        .insert({
                                            client_id: sub.client_id,
                                            amount: inv.amount_paid / 100,
                                            currency: inv.currency.toUpperCase(),
                                            status: 'paid',
                                            description: `Subscription Renewal: ${sub.services?.name || 'Subscription'}`,
                                            stripe_payment_intent_id: inv.payment_intent,
                                            due_date: new Date(inv.created * 1000).toISOString().split('T')[0]
                                        });
                                    
                                    if (error) {
                                        console.error(`      ❌ Error:`, error.message);
                                    } else {
                                        console.log(`      ✅ Created: ${inv.currency.toUpperCase()} ${(inv.amount_paid / 100).toFixed(2)}`);
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        console.error(`    ❌ Error:`, err.message);
                    }
                }
            }
        }
        return;
    }

    console.log(`Found ${subscriptions.length} linked subscription(s)\n`);

    for (const sub of subscriptions) {
        console.log(`📦 Processing: ${sub.services?.name || 'Unknown'}`);
        console.log(`   Stripe Subscription: ${sub.stripe_subscription_id}\n`);

        try {
            const invoices = await stripe.invoices.list({
                subscription: sub.stripe_subscription_id,
                limit: 100,
            });

            console.log(`   Found ${invoices.data.length} invoices in Stripe\n`);

            for (const inv of invoices.data) {
                if (inv.status !== 'paid') continue;

                const { data: existing } = await supabase
                    .from('invoices')
                    .select('id')
                    .eq('stripe_payment_intent_id', inv.payment_intent)
                    .single();

                if (existing) {
                    console.log(`   ⏭️  Invoice already exists for ${inv.payment_intent}`);
                    continue;
                }

                const { error } = await supabase
                    .from('invoices')
                    .insert({
                        client_id: sub.client_id,
                        amount: inv.amount_paid / 100,
                        currency: inv.currency.toUpperCase(),
                        status: 'paid',
                        description: `Subscription Renewal: ${sub.services?.name || 'Subscription'}`,
                        stripe_payment_intent_id: inv.payment_intent,
                        due_date: new Date(inv.created * 1000).toISOString().split('T')[0]
                    });

                if (error) {
                    console.error(`   ❌ Error:`, error.message);
                } else {
                    console.log(`   ✅ Created invoice: ${inv.currency.toUpperCase()} ${(inv.amount_paid / 100).toFixed(2)} - ${new Date(inv.created * 1000).toLocaleDateString()}`);
                }
            }
        } catch (error) {
            console.error(`   ❌ Error:`, error.message);
        }
    }

    console.log('\n✅ Done! Refresh the page to see payment logs.');
}

createInvoices();
