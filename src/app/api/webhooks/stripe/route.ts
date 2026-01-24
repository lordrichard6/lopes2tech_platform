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

            // Handle Subscription Checkout
            if (session.mode === 'subscription' && session.metadata?.subscription_id) {
                const subscriptionId = session.metadata.subscription_id;
                const stripeSubscriptionId = session.subscription as string;
                const stripeCustomerId = session.customer as string;

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

                // 2. Link Client (if we can find the client from the subscription)
                // First get the client_id from the subscription
                const { data: subData } = await supabase
                    .from('subscriptions')
                    .select('client_id')
                    .eq('id', subscriptionId)
                    .single();

                if (subData?.client_id) {
                    await supabase
                        .from('clients')
                        .update({ stripe_customer_id: stripeCustomerId })
                        .eq('id', subData.client_id);
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
                    // 1. Create a "Paid Invoice" record in our system for tracking
                    // This fulfills the "Track payments" requirement
                    const { error: invError } = await supabase
                        .from('invoices')
                        .insert({
                            client_id: sub.client_id,
                            amount: invoice.amount_paid / 100, // Stripe uses cents
                            currency: invoice.currency.toUpperCase(),
                            status: 'paid',
                            description: `Subscription Renewal: ${sub.services?.name}`,
                            stripe_payment_intent_id: invoice.payment_intent as string,
                            // Set due_date to today since it's paid
                            due_date: new Date().toISOString().split('T')[0]
                        });

                    if (invError) console.error('Error creating invoice record:', invError);

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
