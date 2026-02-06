'use server'

import { requireAdmin } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

export async function createSubscriptionCheckoutSession(
    subscriptionId: string,
    stripePriceId: string,
    clientEmail?: string,
    clientName?: string
) {
    if (!stripePriceId) throw new Error("Service has no Stripe Price ID");
    if (!stripe) throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env");

    // Get subscription to find start_date
    const supabase = createAdminClient();
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('start_date, services(billing_type)')
        .eq('id', subscriptionId)
        .single();

    const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    try {
        // Calculate billing cycle anchor based on subscription start_date
        let billingCycleAnchor: number | undefined;
        if (subscription?.start_date) {
            const startDate = new Date(subscription.start_date);
            const now = new Date();
            const billingType = subscription.services?.billing_type || 'monthly';
            
            // Calculate next occurrence of start_date
            const nextAnchor = new Date(startDate);
            
            if (billingType === 'monthly') {
                // Find next month with same day
                while (nextAnchor <= now) {
                    nextAnchor.setMonth(nextAnchor.getMonth() + 1);
                }
            } else if (billingType === 'yearly') {
                // Find next year with same day
                while (nextAnchor <= now) {
                    nextAnchor.setFullYear(nextAnchor.getFullYear() + 1);
                }
            }
            
            // Convert to Unix timestamp (seconds)
            billingCycleAnchor = Math.floor(nextAnchor.getTime() / 1000);
        }

        const sessionConfig: any = {
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: stripePriceId,
                    quantity: 1,
                },
            ],
            customer_email: clientEmail, // Pre-fill email
            success_url: `${origin}/accept/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/accept/cancel`,
            metadata: {
                subscription_id: subscriptionId, // Link back to our DB
                client_name: clientName || '',
            },
        };

        // Add billing cycle anchor if we calculated it
        if (billingCycleAnchor) {
            sessionConfig.subscription_data = {
                billing_cycle_anchor: billingCycleAnchor,
                proration_behavior: 'none', // Don't prorate, charge full amount immediately
            };
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        return { url: session.url };
    } catch (error: any) {
        console.error("Stripe Error:", error);
        throw new Error(error.message);
    }
}
