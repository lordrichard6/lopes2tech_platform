import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientSubscriptionsView } from "@/components/dashboard/client-subscriptions-view";
import { getStripeSubscriptionStatuses } from "@/app/admin/clients/[id]/stripe-subscription-status";

export default async function SubscriptionsPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; canceled?: string; session_id?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Find client linked to this user
    const adminDb = createAdminClient();
    const { data: client } = await adminDb
        .from('clients')
        .select('id, name, contact_email')
        .or(`profile_id.eq.${user.id},contact_email.ilike.${user.email}`)
        .single();

    if (!client) {
        return (
            <div className="p-6">
                <p className="text-muted-foreground">Client profile not found.</p>
            </div>
        );
    }

    // Fetch subscriptions for this client
    const { data: subscriptions } = await adminDb
        .from("subscriptions")
        .select("*, services(*)")
        .eq('client_id', client.id)
        .order('start_date', { ascending: false });

    // Fetch Stripe subscription statuses for subscriptions linked to Stripe
    const stripeSubscriptionIds = subscriptions
        ?.filter(sub => sub.stripe_subscription_id)
        .map(sub => sub.stripe_subscription_id) || [];

    const stripeStatuses = stripeSubscriptionIds.length > 0
        ? await getStripeSubscriptionStatuses(stripeSubscriptionIds)
        : {};

    // Fetch subscription payment invoices
    // Get ALL paid invoices for this client (we'll filter by description in the component)
    const { data: allClientInvoices } = await adminDb
        .from("invoices")
        .select("id, amount, currency, created_at, stripe_payment_intent_id, description, status")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });

    // Filter for subscription-related invoices
    const subscriptionInvoices = allClientInvoices?.filter(inv => 
        inv.status === 'paid' && (
            inv.description?.includes('Subscription Renewal:') || 
            inv.stripe_payment_intent_id !== null
        )
    ) || [];

    return (
        <ClientSubscriptionsView 
            subscriptions={subscriptions || []}
            stripeStatuses={stripeStatuses}
            subscriptionInvoices={subscriptionInvoices || []}
        />
    );
}
