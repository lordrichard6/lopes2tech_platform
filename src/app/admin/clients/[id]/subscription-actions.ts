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

    const { error } = await supabase
        .from('subscriptions')
        .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
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

