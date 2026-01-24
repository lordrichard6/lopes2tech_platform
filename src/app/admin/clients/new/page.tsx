import { createClientAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";

export default function NewClientPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/clients" className="text-sm text-muted-foreground hover:underline">
                    ← Back to Clients
                </Link>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Client</CardTitle>
                    <CardDescription>Create a new client entity to assign projects to.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createClientAction}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="name">Client Name</Label>
                                <Input id="name" name="name" placeholder="Acme Corp" required />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Contact Email</Label>
                                <Input id="email" name="email" type="email" placeholder="contact@acme.com" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button type="submit">Create Client</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
