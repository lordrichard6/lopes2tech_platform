'use server'

import { requireAdmin } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function createSubscriptionCheckoutSession(
    subscriptionId: string,
    stripePriceId: string,
    clientEmail?: string,
    clientName?: string
) {
    if (!stripePriceId) throw new Error("Service has no Stripe Price ID");
    if (!stripe) throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env");

    const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    try {
        const session = await stripe.checkout.sessions.create({
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
        });

        return { url: session.url };
    } catch (error: any) {
        console.error("Stripe Error:", error);
        throw new Error(error.message);
    }
}
