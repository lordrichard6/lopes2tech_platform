'use server'

import { stripe } from '@/lib/stripe'

export async function checkRefundStatus(paymentIntentId: string | null): Promise<boolean> {
    if (!stripe || !paymentIntentId) {
        return false;
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        // Check if payment was refunded
        if (paymentIntent.amount_refunded > 0) {
            return true; // Fully or partially refunded
        }

        // Also check charges for refunds
        if (paymentIntent.charges?.data.length > 0) {
            const charge = paymentIntent.charges.data[0];
            if (charge.refunded || charge.amount_refunded > 0) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error('Error checking refund status:', error);
        return false; // Assume not refunded if we can't check
    }
}

export async function checkRefundStatuses(paymentIntentIds: (string | null)[]): Promise<Record<string, boolean>> {
    if (!stripe || paymentIntentIds.length === 0) {
        return {};
    }

    const statuses: Record<string, boolean> = {};

    await Promise.all(
        paymentIntentIds.map(async (id) => {
            if (id) {
                statuses[id] = await checkRefundStatus(id);
            }
        })
    );

    return statuses;
}
