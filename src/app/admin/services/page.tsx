import { createClient } from "@/lib/supabase/server";
import { ServiceDialog } from "./service-dialog";
import { ServicesList } from "./services-list";
import { ServiceImportExport } from "./service-import-export";

export default async function AdminServicesPage() {
    const supabase = await createClient();
    const { data: services } = await supabase
        .from("services")
        .select("*")
        .order("name", { ascending: true });

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Services Catalog</h1>
                    <p className="text-muted-foreground">Manage your agency&apos;s offerings and pricing.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <ServiceImportExport services={services || []} />
                    <ServiceDialog mode="create" />
                </div>
            </div>

            <ServicesList initialServices={services || []} />
        </div>
    );
}

