import { createProjectAction } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

export default async function NewProjectPage() {
    const supabase = await createClient();
    const { data: clients } = await supabase.from('clients').select('id, name').order('name');
    const { data: oneTimeServices } = await supabase
        .from('services')
        .select('id, name, price')
        .eq('active', true)
        .eq('billing_type', 'one_time')
        .order('name');

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/projects" className="text-sm text-muted-foreground hover:underline">
                    ← Back to Projects
                </Link>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Create New Project</CardTitle>
                    <CardDescription>Initialize a new project for a client.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createProjectAction}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="name">Project Name</Label>
                                <Input id="name" name="name" placeholder="Website Relaunch" required />
                            </div>

                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="clientId">Client</Label>
                                <div className="relative">
                                    <select
                                        name="clientId"
                                        id="clientId"
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        required
                                    >
                                        <option value="" disabled selected>Select a client...</option>
                                        {clients?.map(client => (
                                            <option key={client.id} value={client.id}>
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <p className="text-xs text-muted-foreground">Basic select used for simplicity. Can upgrade to Combobox later.</p>
                            </div>

                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea id="description" name="description" placeholder="Project details..." />
                            </div>

                            <div className="flex flex-col space-y-3 pt-2">
                                <Label>Included Services</Label>
                                <div className="grid grid-cols-2 gap-4 border p-4 rounded-md">
                                    {oneTimeServices?.length ? oneTimeServices.map((service) => (
                                        <div key={service.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`service-${service.id}`}
                                                name="service_ids"
                                                value={service.id}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <label
                                                htmlFor={`service-${service.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {service.name} <span className="text-muted-foreground">(CHF {service.price})</span>
                                            </label>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-muted-foreground col-span-2">No active services found.</p>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">Select the one-time services included in this project.</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button type="submit">Create Project</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
