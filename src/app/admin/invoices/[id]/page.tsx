import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, CreditCard, FileText, Building2, AlertTriangle, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DeletePaymentButton } from "./delete-payment-button";
import { InvoiceActions } from "./invoice-actions";
import { PaymentScheduleDialog } from "./payment-schedule-dialog";
import { PaymentScheduleTable } from "./payment-schedule-table";
import { EditPaymentDialog } from "./edit-payment-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch invoice with client and project info
    const { data: invoice, error } = await supabase
        .from("invoices")
        .select(`
            *,
            clients ( name, contact_email ),
            projects ( name )
        `)
        .eq("id", id)
        .single();

    // Fetch system settings for payment info
    const { data: settings } = await supabase
        .from("system_settings")
        .select("*")
        .single();

    if (!invoice) return notFound();

    // Fetch schedules separately to avoid crashing if table/relation missing
    let schedules: any[] = [];
    try {
        console.log("Fetching schedules for invoice:", id);
        const { data: scheduleData, error: scheduleError } = await supabase
            .from("invoice_payment_schedules")
            .select("*")
            .eq("invoice_id", id)
            .order("installment_number", { ascending: true });

        if (scheduleError) {
            console.error("Supabase Error fetching schedules:", scheduleError);
        }

        if (scheduleData) {
            console.log("Found schedules:", scheduleData.length);
            schedules = scheduleData;
        } else {
            console.log("No schedules found (data is null)");
        }
    } catch (e) {
        console.error("Failed to load payment schedules:", e);
    }

    // Fetch payment history
    const { data: payments } = await supabase
        .from("invoice_payments")
        .select("*")
        .eq("invoice_id", id)
        .order("payment_date", { ascending: false });

    const remainingAmount = invoice.amount - (invoice.amount_paid || 0);
    const paymentProgress = invoice.amount > 0 ? ((invoice.amount_paid || 0) / invoice.amount) * 100 : 0;
    const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'paid';
    const isPaid = invoice.status === 'paid';
    const isCancelled = invoice.status === 'cancelled';

    // Generate display invoice number
    const invoiceNumber = invoice.description?.match(/INV-[\w-]+/)?.[0] || `INV-${invoice.id.slice(0, 8).toUpperCase()}`;

    // Status badge styling
    const getStatusBadgeClass = () => {
        switch (invoice.status) {
            case 'paid': return 'bg-green-500 hover:bg-green-600 text-white';
            case 'partial': return 'bg-blue-500 hover:bg-blue-600 text-white';
            case 'cancelled': return 'bg-gray-500 hover:bg-gray-600 text-white';
            case 'overdue': return 'bg-red-500 hover:bg-red-600 text-white';
            default: return isOverdue ? 'bg-red-500 hover:bg-red-600 text-white' : '';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Overdue Warning Banner */}
            {isOverdue && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                        <span className="font-medium text-red-600 dark:text-red-400">
                            This invoice is overdue
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                            Due date was {format(new Date(invoice.due_date), 'MMMM d, yyyy')}
                        </span>
                    </div>
                </div>
            )}

            {/* Cancelled Warning Banner */}
            {isCancelled && (
                <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                        This invoice has been cancelled
                    </span>
                </div>
            )}

            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b -mx-6 px-6 md:mx-0 md:px-0 md:border-b-0 md:bg-transparent md:static">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href="/admin/invoices" className="text-muted-foreground hover:text-foreground transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{invoiceNumber}</h1>
                                <p className="text-xs text-muted-foreground font-mono">{invoice.id}</p>
                            </div>
                            <Badge className={`ml-2 capitalize ${getStatusBadgeClass()}`}>
                                {isOverdue && invoice.status === 'pending' ? 'overdue' : invoice.status}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground ml-7">
                            Created on {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                        </p>
                    </div>
                    <InvoiceActions invoice={invoice} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Left Column) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Items / Description Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-muted/50 border flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="font-medium text-base">
                                            {invoice.description || "Services Rendered"}
                                        </div>
                                        {invoice.projects && (
                                            <Link
                                                href={`/admin/projects/${invoice.project_id}`}
                                                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                                            >
                                                <FileText className="h-3.5 w-3.5" />
                                                <span>Project: {invoice.projects.name}</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        )}
                                    </div>
                                    <div className="font-semibold text-lg">
                                        {invoice.currency} {invoice.amount.toLocaleString()}
                                    </div>
                                </div>

                                {invoice.due_date && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Due Date:</span>
                                        <span className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                                            {format(new Date(invoice.due_date), 'MMMM d, yyyy')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Schedule */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Payment Schedule</CardTitle>
                            {!isPaid && !isCancelled && (
                                <PaymentScheduleDialog invoice={invoice} existingSchedules={schedules} />
                            )}
                        </CardHeader>
                        <CardContent>
                            {schedules.length > 0 ? (
                                <PaymentScheduleTable schedules={schedules} invoice={invoice} settings={settings} />
                            ) : (
                                <div className="text-center py-6 text-muted-foreground text-sm">
                                    No payment schedule set. Invoice is due in full.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Payment History</CardTitle>
                                <CardDescription className="mt-1">
                                    {payments && payments.length > 0
                                        ? `${payments.length} transactions recorded`
                                        : 'No transactions yet'
                                    }
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {payments && payments.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.map((payment: any) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>
                                                    {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell className="font-medium text-green-600">
                                                    + {invoice.currency} {payment.amount.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    {payment.payment_method || '-'}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {payment.reference || '-'}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                                    {payment.notes || '-'}
                                                </TableCell>
                                                <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <EditPaymentDialog
                                                                invoiceId={invoice.id}
                                                                payment={payment}
                                                                trigger={
                                                                    <button className="flex w-full items-center gap-2 text-sm">
                                                                        <Pencil className="h-4 w-4" />
                                                                        <span>Edit payment</span>
                                                                    </button>
                                                                }
                                                            />
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <DeletePaymentButton paymentId={payment.id} asChild>
                                                                <button className="flex w-full items-center gap-2 text-sm text-red-600">
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span>Delete</span>
                                                                </button>
                                                            </DeletePaymentButton>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                    <CreditCard className="h-10 w-10 mb-3 opacity-20" />
                                    <p className="font-medium">No payments yet</p>
                                    <p className="text-sm opacity-70">Mark the invoice as paid or record a partial payment.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar (Right Column) */}
                <div className="space-y-6">

                    {/* Summary Card */}
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-wider">
                                Payment Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{invoice.currency} {invoice.amount.toLocaleString()}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-baseline">
                                    <span className="font-medium">Total Due</span>
                                    <span className="text-2xl font-bold">
                                        {invoice.currency} {invoice.amount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 bg-background rounded-lg border space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Paid to date</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">
                                        {invoice.currency} {(invoice.amount_paid || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Remaining</span>
                                    <span className={`font-bold ${remainingAmount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                                        {invoice.currency} {remainingAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                        <span>Progress</span>
                                        <span>{Math.round(paymentProgress)}%</span>
                                    </div>
                                    <Progress value={paymentProgress} className="h-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Client Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-wider">
                                Bill To
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <div className="font-semibold text-base">{invoice.clients?.name}</div>
                                    <div className="text-sm text-muted-foreground break-all">
                                        {invoice.clients?.contact_email}
                                    </div>
                                    <Link href={`/admin/clients/${invoice.client_id}`} className="text-xs text-primary hover:underline inline-flex items-center gap-1 pt-1">
                                        View Client Profile
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
