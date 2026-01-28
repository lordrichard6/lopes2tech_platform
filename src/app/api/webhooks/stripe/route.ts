import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('Stripe-Signature') as string;

    if (!stripe) {
        return new NextResponse('Stripe is not configured', { status: 503 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: unknown) {
        return new NextResponse(`Webhook Error: ${(error as Error).message}`, { status: 400 });
    }

    const supabase = createAdminClient();

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            // Handle One-Time Payment Checkout
            if (session.mode === 'payment' && session.metadata?.invoiceId) {
                const invoiceId = session.metadata.invoiceId;
                const paymentIntentId = session.payment_intent as string;
                const amountPaid = session.amount_total ? session.amount_total / 100 : null;

                if (!amountPaid) {
                    console.error('No amount found in session');
                } else {
                    // Get invoice to get the full amount
                    const { data: invoice } = await supabase
                        .from('invoices')
                        .select('amount')
                        .eq('id', invoiceId)
                        .single();

                    if (invoice) {
                        // 1. Create payment record
                        const { error: paymentError } = await supabase
                            .from('invoice_payments')
                            .insert({
                                invoice_id: invoiceId,
                                amount: amountPaid,
                                payment_date: new Date().toISOString().split('T')[0],
                                payment_method: 'stripe',
                                reference: paymentIntentId,
                                notes: 'Payment via Stripe Checkout'
                            });

                        if (paymentError) {
                            console.error('Error creating payment record:', paymentError);
                        }

                        // 2. Update invoice - amount_paid and status will be updated by trigger
                        const { error: updateError } = await supabase
                            .from('invoices')
                            .update({
                                stripe_payment_intent_id: paymentIntentId,
                                amount_paid: amountPaid,
                                status: amountPaid >= invoice.amount ? 'paid' : 'partial'
                            })
                            .eq('id', invoiceId);

                        if (updateError) {
                            console.error('Error updating invoice status:', updateError);
                        } else {
                            console.log('Updated invoice to paid status:', {
                                invoiceId,
                                paymentIntentId,
                                amount: amountPaid
                            });
                        }
                    }
                }
            }

            // Handle Subscription Checkout
            if (session.mode === 'subscription' && session.metadata?.subscription_id) {
                const subscriptionId = session.metadata.subscription_id;
                const stripeSubscriptionId = session.subscription as string;
                const stripeCustomerId = session.customer as string;

                // Get subscription with service details
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('*, services(name)')
                    .eq('id', subscriptionId)
                    .single();

                if (!sub) {
                    console.error('Subscription not found:', subscriptionId);
                } else {
                    // 1. Link Subscription
                    const { error: subError } = await supabase
                        .from('subscriptions')
                        .update({
                            stripe_subscription_id: stripeSubscriptionId,
                            status: 'active',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', subscriptionId);

                    if (subError) console.error('Error linking subscription:', subError);

                    // 2. Link Client
                    await supabase
                        .from('clients')
                        .update({ stripe_customer_id: stripeCustomerId })
                        .eq('id', sub.client_id);

                    // 3. Create invoice for initial payment
                    // Get payment amount from Stripe subscription
                    try {
                        const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
                        const amountPaid = session.amount_total ? session.amount_total / 100 : stripeSubscription.items.data[0]?.price?.unit_amount ? stripeSubscription.items.data[0].price.unit_amount / 100 : sub.amount;
                        const currency = session.currency?.toUpperCase() || 'CHF';
                        const paymentIntentId = session.payment_intent as string;

                        // Create invoice
                        const { data: newInvoice, error: invError } = await supabase
                            .from('invoices')
                            .insert({
                                client_id: sub.client_id,
                                amount: amountPaid,
                                currency: currency,
                                status: 'paid',
                                amount_paid: amountPaid,
                                description: `Subscription Renewal: ${sub.services?.name || 'Subscription'}`,
                                stripe_payment_intent_id: paymentIntentId || null,
                                due_date: new Date().toISOString().split('T')[0]
                            })
                            .select('id')
                            .single();

                        if (invError) {
                            console.error('Error creating invoice for initial payment:', invError);
                        } else if (newInvoice && paymentIntentId) {
                            // Create payment record
                            await supabase
                                .from('invoice_payments')
                                .insert({
                                    invoice_id: newInvoice.id,
                                    amount: amountPaid,
                                    payment_date: new Date().toISOString().split('T')[0],
                                    payment_method: 'stripe',
                                    reference: paymentIntentId,
                                    notes: 'Initial subscription payment via Stripe'
                                });

                            console.log('Created invoice for initial subscription payment:', {
                                subscriptionId,
                                invoiceId: newInvoice.id,
                                amount: amountPaid,
                                currency
                            });
                        }
                    } catch (error) {
                        console.error('Error fetching Stripe subscription details:', error);
                    }
                }
            }
        }

        if (event.type === 'invoice.payment_succeeded') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const invoice = event.data.object as any;

            // Handle Subscription Payment (Recurring)
            if (invoice.subscription) {
                const stripeSubscriptionId = invoice.subscription as string;

                // Find our subscription
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('*, clients(id, name), services(name)')
                    .eq('stripe_subscription_id', stripeSubscriptionId)
                    .single();

                if (sub) {
                    const amountPaid = invoice.amount_paid / 100; // Stripe uses cents
                    const paymentIntentId = invoice.payment_intent as string;

                    // 1. Create a "Paid Invoice" record in our system for tracking
                    // This fulfills the "Track payments" requirement
                    const { data: newInvoice, error: invError } = await supabase
                        .from('invoices')
                        .insert({
                            client_id: sub.client_id,
                            amount: amountPaid,
                            currency: invoice.currency.toUpperCase(),
                            status: 'paid',
                            amount_paid: amountPaid,
                            description: `Subscription Renewal: ${sub.services?.name}`,
                            stripe_payment_intent_id: paymentIntentId,
                            // Set due_date to today since it's paid
                            due_date: new Date().toISOString().split('T')[0]
                        })
                        .select('id')
                        .single();

                    if (invError) {
                        console.error('Error creating invoice record:', invError);
                    } else if (newInvoice && paymentIntentId) {
                        // Create payment record
                        await supabase
                            .from('invoice_payments')
                            .insert({
                                invoice_id: newInvoice.id,
                                amount: amountPaid,
                                payment_date: new Date().toISOString().split('T')[0],
                                payment_method: 'stripe',
                                reference: paymentIntentId,
                                notes: 'Recurring subscription payment via Stripe'
                            });
                    }

                    // 2. Update Subscription Period
                    // We can also update `current_period_end` if we added that column
                    await supabase
                        .from('subscriptions')
                        .update({
                            // status: 'active', // Ensure it's active
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', sub.id);
                }
            }
        }

    } catch (error: unknown) {
        console.error('Webhook handler failed:', error);
        return new NextResponse(`Webhook handler failed: ${(error as Error).message}`, { status: 500 });
    }

    return new NextResponse('Received', { status: 200 });
}
