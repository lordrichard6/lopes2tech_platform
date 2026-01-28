'use server'

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function createClientSubscriptionCheckout(
    subscriptionId: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Find client linked to this user
    const adminDb = createAdminClient();
    const { data: client } = await adminDb
        .from('clients')
        .select('id, name, contact_email')
        .or(`profile_id.eq.${user.id},contact_email.ilike.${user.email}`)
        .single();

    if (!client) {
        throw new Error("Client profile not found");
    }

    // Fetch subscription and verify it belongs to this client
    const { data: subscription } = await adminDb
        .from('subscriptions')
        .select('*, services(*)')
        .eq('id', subscriptionId)
        .eq('client_id', client.id)
        .single();

    if (!subscription) {
        throw new Error("Subscription not found");
    }

    if (!subscription.services?.stripe_price_id) {
        throw new Error("This service is not linked to Stripe. Please contact support.");
    }

    if (!stripe) {
        throw new Error("Stripe is not configured");
    }

    const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    try {
        // Calculate billing cycle anchor based on subscription start_date
        let billingCycleAnchor: number | undefined;
        if (subscription.start_date) {
            const startDate = new Date(subscription.start_date);
            const now = new Date();
            const billingType = subscription.services?.billing_type || 'monthly';
            
            // Calculate next occurrence of start_date
            let nextAnchor = new Date(startDate);
            
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
                    price: subscription.services.stripe_price_id,
                    quantity: 1,
                },
            ],
            customer_email: client.contact_email || user.email || undefined,
            success_url: `${origin}/subscriptions?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/subscriptions?canceled=true`,
            metadata: {
                subscription_id: subscriptionId,
                client_id: client.id,
                client_name: client.name || '',
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
        throw new Error(error.message || "Failed to create checkout session");
    }
}
