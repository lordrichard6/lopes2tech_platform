'use client'

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Pencil, CheckCircle, Trash2 } from "lucide-react";
import { EditInvoiceDialog } from "./edit-invoice-dialog";
import { CreateInvoiceDialog } from "./create-invoice-dialog";
import { markInvoicePaidAction, deleteInvoiceAction } from "./actions";
import { toast } from "sonner";
import { InvoicesTableSkeleton } from "./invoice-skeleton";

type Invoice = {
    id: string;
    client_id: string;
    project_id?: string | null;
    amount: number;
    amount_paid: number;
    description?: string;
    status: string;
    due_date?: string | null;
    currency: string;
    created_at: string;
    clients?: { name: string } | null;
};

export default function AdminInvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    useEffect(() => {
        fetchInvoices();
    }, []);

    async function fetchInvoices() {
        const supabase = createClient();
        const { data } = await supabase
            .from("invoices")
            .select("*, clients(name)")
            .order('created_at', { ascending: false });

        if (data) {
            setInvoices(data as Invoice[]);
        }
        setLoading(false);
    }

    function handleEditClick(invoice: Invoice) {
        setEditingInvoice(invoice);
        setIsEditDialogOpen(true);
    }

    function handleDialogClose() {
        setIsEditDialogOpen(false);
        setEditingInvoice(null);
        fetchInvoices(); // Refresh the list
    }

    async function handleMarkPaid(invoiceId: string) {
        const formData = new FormData();
        formData.append('invoiceId', invoiceId);
        await markInvoicePaidAction(formData);
        fetchInvoices(); // Refresh the list
    }

    async function handleDelete(invoiceId: string) {
        if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) return;

        const result = await deleteInvoiceAction(invoiceId);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Invoice deleted successfully");
            fetchInvoices();
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <CreateInvoiceDialog onSuccess={fetchInvoices} />
                </div>
                <InvoicesTableSkeleton />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                <CreateInvoiceDialog onSuccess={fetchInvoices} />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead className="w-[200px]">Payment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices?.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell className="font-mono text-xs">{invoice.id.slice(0, 8)}...</TableCell>
                                <TableCell>{invoice.clients?.name}</TableCell>
                                <TableCell>{new Date(invoice.created_at).toLocaleDateString('en-GB')}</TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">{invoice.currency} {invoice.amount.toLocaleString()}</div>
                                        {invoice.amount_paid > 0 && (
                                            <div className="text-xs text-muted-foreground">
                                                Paid: {invoice.currency} {invoice.amount_paid.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {invoice.amount_paid > 0 ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Progress
                                                    value={(invoice.amount_paid / invoice.amount) * 100}
                                                    className="h-2 flex-1"
                                                />
                                                <span className="text-xs text-muted-foreground min-w-[40px] text-right">
                                                    {Math.round((invoice.amount_paid / invoice.amount) * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">No payments</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        invoice.status === 'paid' ? 'default' :
                                            invoice.status === 'partial' ? 'secondary' :
                                                invoice.status === 'overdue' ? 'destructive' :
                                                    'outline'
                                    } className="capitalize">
                                        {invoice.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/invoices/${invoice.id}`} className="flex items-center cursor-pointer">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Invoice
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="flex items-center cursor-pointer"
                                                onClick={() => handleEditClick(invoice)}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit Invoice
                                            </DropdownMenuItem>
                                            {invoice.status === 'pending' && (
                                                <DropdownMenuItem
                                                    className="flex items-center cursor-pointer"
                                                    onClick={() => handleMarkPaid(invoice.id)}
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Mark Paid
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem
                                                className="flex items-center cursor-pointer text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(invoice.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Invoice
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!invoices?.length && !loading && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No invoices found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            {editingInvoice && (
                <EditInvoiceDialog
                    invoice={editingInvoice}
                    open={isEditDialogOpen}
                    onOpenChange={(open) => {
                        if (!open) handleDialogClose();
                        setIsEditDialogOpen(open);
                    }}
                />
            )}
        </div>
    );
}
