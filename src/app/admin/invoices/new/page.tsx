import { createClient } from "@/lib/supabase/server";
import { createInvoiceAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Only Server Components can be async
export default async function NewInvoicePage() {
    const supabase = await createClient();

    // Fetch clients for dropdown
    const { data: clients } = await supabase.from('clients').select('id, name');
    // Fetch projects for dropdown
    const { data: projects } = await supabase.from('projects').select('id, name');

    return (
        <div className="max-w-xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/invoices" className="text-sm text-muted-foreground hover:underline">
                    ← Back to Invoices
                </Link>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Create New Invoice</CardTitle>
                    <CardDescription>Issue a payment request to a client.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createInvoiceAction} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="clientId">Client</Label>
                            <div className="relative">
                                <select name="clientId" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="">Select a client...</option>
                                    {clients?.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="projectId">Project (Optional)</Label>
                            <div className="relative">
                                <select name="projectId" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="">Select a project...</option>
                                    {projects?.map(project => (
                                        <option key={project.id} value={project.id}>{project.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (CHF)</Label>
                                <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input id="dueDate" name="dueDate" type="date" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" name="description" placeholder="e.g. Web Development - Phase 1" />
                        </div>

                        <Button type="submit" className="w-full">Create Invoice</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
