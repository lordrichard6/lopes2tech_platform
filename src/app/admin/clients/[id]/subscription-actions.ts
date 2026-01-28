'use server'

import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createSubscription(data: {
    client_id: string;
    service_id: string;
    amount: number;
    start_date: string;
}) {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
        .from('subscriptions')
        .insert(data);

    if (error) throw new Error(error.message);
    revalidatePath(`/admin/clients/${data.client_id}`);
}

export async function cancelSubscription(id: string, clientId?: string) {
    const { supabase } = await requireAdmin();

    // Also cancel in Stripe if linked
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('id', id)
        .single();

    if (subscription?.stripe_subscription_id) {
        try {
            const { stripe } = await import('@/lib/stripe');
            if (stripe) {
                await stripe.subscriptions.update(subscription.stripe_subscription_id, {
                    cancel_at_period_end: true
                });
            }
        } catch (error) {
            console.error('Error cancelling Stripe subscription:', error);
            // Continue with local cancellation even if Stripe fails
        }
    }

    const { error } = await supabase
        .from('subscriptions')
        .update({
            status: 'cancelled'
        })
        .eq('id', id);

    if (error) throw new Error(error.message);

    if (clientId) {
        revalidatePath(`/admin/clients/${clientId}`);
    }
}

export async function deleteSubscription(id: string, clientId?: string) {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);

    if (clientId) {
        revalidatePath(`/admin/clients/${clientId}`);
    }
}

