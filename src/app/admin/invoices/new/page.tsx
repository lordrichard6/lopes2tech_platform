import { CreateInvoiceDialog } from "../create-invoice-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default async function NewInvoicePage() {
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
                    <CreateInvoiceDialog>
                        <Button className="w-full" size="lg">
                            Open Invoice Creator
                        </Button>
                    </CreateInvoiceDialog>
                </CardContent>
            </Card>
        </div>
    );
}
