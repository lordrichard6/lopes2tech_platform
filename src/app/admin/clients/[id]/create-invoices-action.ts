'use server'

import { createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { requireAdmin } from "@/lib/auth";

export async function createInvoicesFromStripe(subscriptionId: string) {
    await requireAdmin();
    
    if (!stripe) {
        throw new Error("Stripe is not configured");
    }

    const supabase = createAdminClient();

    // Get subscription with client email
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*, services(name), clients(id, contact_email)')
        .eq('id', subscriptionId)
        .single();

    if (!subscription) {
        throw new Error("Subscription not found");
    }

    let stripeSubscriptionId = subscription.stripe_subscription_id;
    let customerId: string | null = null;

    // If not linked, try to link it
    if (!stripeSubscriptionId && subscription.clients?.contact_email) {
        try {
            const customers = await stripe.customers.list({
                email: subscription.clients.contact_email,
                limit: 1
            });

            if (customers.data.length > 0) {
                customerId = customers.data[0].id;
                const stripeSubs = await stripe.subscriptions.list({
                    customer: customerId,
                    limit: 10
                });

                if (stripeSubs.data.length > 0) {
                    // Find the subscription that matches this service
                    const matchingSub = stripeSubs.data.find(sub => {
                        // Try to match by price ID if available
                        if (subscription.services?.stripe_price_id) {
                            return sub.items.data.some(item => 
                                item.price.id === subscription.services.stripe_price_id
                            );
                        }
                        return true; // Take first one if no price ID
                    }) || stripeSubs.data[0];

                    const { error: updateError } = await supabase
                        .from('subscriptions')
                        .update({ stripe_subscription_id: matchingSub.id })
                        .eq('id', subscriptionId);

                    if (!updateError) {
                        stripeSubscriptionId = matchingSub.id;
                    }
                }
            }
        } catch (error) {
            console.error('Error linking subscription:', error);
        }
    }

    let created = 0;
    let skipped = 0;
    let total = 0;

    // If we have a Stripe subscription ID, get invoices from it
    if (stripeSubscriptionId) {
        const stripeInvoices = await stripe.invoices.list({
            subscription: stripeSubscriptionId,
            limit: 100,
        });

        total = stripeInvoices.data.filter(i => i.status === 'paid').length;

        for (const stripeInv of stripeInvoices.data) {
            if (stripeInv.status !== 'paid') continue;

            // Check if invoice already exists
            const { data: existing } = await supabase
                .from('invoices')
                .select('id')
                .eq('stripe_payment_intent_id', stripeInv.payment_intent)
                .single();

            if (existing) {
                skipped++;
                continue;
            }

            // Create invoice
            const { error } = await supabase
                .from('invoices')
                .insert({
                    client_id: subscription.client_id,
                    amount: stripeInv.amount_paid / 100,
                    currency: stripeInv.currency.toUpperCase(),
                    status: 'paid',
                    description: `Subscription Renewal: ${subscription.services?.name || 'Subscription'}`,
                    stripe_payment_intent_id: stripeInv.payment_intent,
                    due_date: new Date(stripeInv.created * 1000).toISOString().split('T')[0]
                });

            if (error) {
                console.error('Error creating invoice:', error);
            } else {
                created++;
            }
        }
    } else if (customerId || subscription.clients?.contact_email) {
        // If no subscription link, try to find payment intents directly
        try {
            const searchCustomerId = customerId || (await stripe.customers.list({
                email: subscription.clients.contact_email,
                limit: 1
            })).data[0]?.id;

            if (searchCustomerId) {
                // Get payment intents for this customer
                const paymentIntents = await stripe.paymentIntents.list({
                    customer: searchCustomerId,
                    limit: 100,
                });

                total = paymentIntents.data.filter(pi => pi.status === 'succeeded').length;

                for (const pi of paymentIntents.data) {
                    if (pi.status !== 'succeeded') continue;

                    // Check if invoice already exists
                    const { data: existing } = await supabase
                        .from('invoices')
                        .select('id')
                        .eq('stripe_payment_intent_id', pi.id)
                        .single();

                    if (existing) {
                        skipped++;
                        continue;
                    }

                    // Create invoice
                    const { error } = await supabase
                        .from('invoices')
                        .insert({
                            client_id: subscription.client_id,
                            amount: pi.amount / 100,
                            currency: pi.currency.toUpperCase(),
                            status: 'paid',
                            description: `Subscription Payment: ${subscription.services?.name || 'Subscription'}`,
                            stripe_payment_intent_id: pi.id,
                            due_date: new Date(pi.created * 1000).toISOString().split('T')[0]
                        });

                    if (error) {
                        console.error('Error creating invoice:', error);
                    } else {
                        created++;
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching payment intents:', error);
        }
    }

    if (created === 0 && skipped === 0) {
        throw new Error("No payments found in Stripe. Make sure the subscription is linked or payments exist for this customer.");
    }

    return {
        success: true,
        created,
        skipped,
        total
    };
}
