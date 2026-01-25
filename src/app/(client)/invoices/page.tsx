import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin"; // Bypass RLS
import { redirect } from "next/navigation";
import { ClientInvoicesView } from "@/components/dashboard/client-invoices-view";

export default async function InvoicesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Bypass RLS to find the client linked to this user (by ID or Email)
    const adminDb = createAdminClient();

    // Find client
    const { data: client } = await adminDb
        .from('clients')
        .select('id, name')
        .or(`user_id.eq.${user.id},contact_email.ilike.${user.email}`)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let invoices: any[] = [];

    if (client) {
        // Fetch invoices for this client (bypassing RLS to ensure visibility)
        const { data, error } = await adminDb
            .from("invoices")
            .select("*, clients(name)")
            .eq('client_id', client.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            invoices = data;
        } else if (error) {
            console.error("Error fetching invoices:", error);
        }
    }

    return (
        <ClientInvoicesView invoices={invoices} />
    );
}
