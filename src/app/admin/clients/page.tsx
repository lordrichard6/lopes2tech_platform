import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClientTable } from "./client-table";
import { ClientImportExport } from "./client-import-export";
import { unstable_noStore } from "next/cache";

export default async function AdminClientsPage() {
    unstable_noStore(); // Prevent caching to ensure fresh data
    const supabase = await createClient();
    const { data: clients, error } = await supabase
        .from("clients")
        .select("*, profiles:profile_id(avatar_url)")
        .order('created_at', { ascending: false });

    // Transform data to flatten the avatar_url from profiles
    const clientsWithAvatar = clients?.map(client => ({
        ...client,
        avatar_url: client.profiles?.avatar_url || null
    })) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                <div className="flex gap-2">
                    <ClientImportExport clients={clientsWithAvatar} />
                    <Button asChild>
                        <Link href="/admin/clients/new">Add Client</Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Clients</CardTitle>
                    <CardDescription>Manage your client roster here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ClientTable data={clientsWithAvatar} />
                </CardContent>
            </Card>
        </div>
    );
}
