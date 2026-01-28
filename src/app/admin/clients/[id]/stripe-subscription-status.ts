'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export interface StripeSubscriptionStatus {
    status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing' | 'paused' | null
    currentPeriodEnd: Date | null
    currentPeriodStart: Date | null
    cancelAtPeriodEnd: boolean
    latestInvoiceStatus: 'paid' | 'open' | 'void' | 'uncollectible' | 'draft' | null
    nextPaymentDate: Date | null
    lastPaymentDate: Date | null
    amountDue: number | null
}

export async function getStripeSubscriptionStatus(
    stripeSubscriptionId: string
): Promise<StripeSubscriptionStatus | null> {
    if (!stripe) {
        console.warn('Stripe is not configured. Set STRIPE_SECRET_KEY in your .env file.')
        return null
    }
    
    if (!stripeSubscriptionId) {
        return null
    }

    try {
        // Fetch subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
            expand: ['latest_invoice', 'latest_invoice.payment_intent']
        })

        // Get latest invoice
        const latestInvoice = subscription.latest_invoice
        const invoice = typeof latestInvoice === 'object' ? latestInvoice : null

        // Get payment intent from invoice
        const paymentIntent = invoice?.payment_intent
        const pi = typeof paymentIntent === 'object' ? paymentIntent : null

        // Calculate next payment date (current period end)
        const nextPaymentDate = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null

        // Get last payment date from latest invoice if paid
        let lastPaymentDate: Date | null = null
        if (invoice?.status === 'paid' && invoice.status_transitions?.paid_at) {
            lastPaymentDate = new Date(invoice.status_transitions.paid_at * 1000)
        }

        // Get amount due from latest invoice
        const amountDue = invoice?.amount_due ? invoice.amount_due / 100 : null

        return {
            status: subscription.status as StripeSubscriptionStatus['status'],
            currentPeriodEnd: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000)
                : null,
            currentPeriodStart: subscription.current_period_start
                ? new Date(subscription.current_period_start * 1000)
                : null,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            latestInvoiceStatus: invoice?.status as StripeSubscriptionStatus['latestInvoiceStatus'],
            nextPaymentDate,
            lastPaymentDate,
            amountDue,
        }
    } catch (error: any) {
        console.error('Error fetching Stripe subscription status:', error.message)
        return null
    }
}

export async function getStripeSubscriptionStatuses(
    subscriptionIds: string[]
): Promise<Record<string, StripeSubscriptionStatus | null>> {
    if (!stripe || !subscriptionIds.length) {
        return {}
    }

    const statuses: Record<string, StripeSubscriptionStatus | null> = {}

    // Fetch all subscriptions in parallel
    await Promise.all(
        subscriptionIds.map(async (id) => {
            statuses[id] = await getStripeSubscriptionStatus(id)
        })
    )

    return statuses
}
