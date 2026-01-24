"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoreHorizontal, Download, CheckCircle, Clock, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { generateSwissQRBase64 } from "@/lib/pdf/generate-qr-bill";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { confirmPaymentAction } from "@/app/admin/invoices/actions";

interface PaymentScheduleTableProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schedules: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invoice: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    settings: any;
}

export function PaymentScheduleTable({ schedules, invoice, settings }: PaymentScheduleTableProps) {
    const router = useRouter();
    const supabase = createClient();
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const syncInvoiceTotal = async (invoiceId: string) => {
        const { data: payments } = await supabase
            .from('invoice_payments')
            .select('amount')
            .eq('invoice_id', invoiceId);

        const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

        await supabase
            .from('invoices')
            .update({
                amount_paid: totalPaid,
                status: totalPaid >= invoice.amount ? 'paid' : totalPaid > 0 ? 'partial' : 'pending'
            })
            .eq('id', invoiceId);
    };

    const generateQRCode = async (schedule: any) => {
        const accountNumber = settings?.qr_iban || settings?.iban;

        if (!accountNumber) {
            throw new Error("IBAN not configured in settings");
        }

        const client = invoice.clients;

        // Parse addresses
        const parseAddress = (addr: string) => {
            const match = addr?.match(/^(.+?)\s+(\d+)$/);
            return match ? { street: match[1], buildingNumber: parseInt(match[2]) } : { street: addr || '' };
        };

        const creditorAddr = parseAddress(settings.creditor_street || '');
        const debtorAddr = parseAddress(client.address || ''); // Assuming client address fields match structure

        const qrData: any = {
            currency: invoice.currency === 'EUR' ? 'EUR' : 'CHF',
            amount: schedule.amount,
            creditor: {
                name: settings.account_holder || 'Lopes2Tech',
                account: accountNumber,
                address: creditorAddr.street,
                zip: parseInt(settings.creditor_zip || '8000'),
                city: settings.creditor_city || 'Zurich',
                country: (settings.creditor_country && settings.creditor_country.length === 2) ? settings.creditor_country : 'CH'
            },
            debtor: {
                name: client.name || 'Client',
                address: debtorAddr.street,
                zip: parseInt(client.zip || '8000'),
                city: client.city || 'Zurich',
                country: (client.country && client.country.length === 2) ? client.country : 'CH'
            },
            reference: schedule.qr_reference || '',
            message: `Payment ${schedule.installment_number} of ${schedules.length} - ${invoice.description || 'Service Invoice'}`
        };

        if (creditorAddr.buildingNumber) qrData.creditor.buildingNumber = creditorAddr.buildingNumber;
        if (debtorAddr.buildingNumber) qrData.debtor.buildingNumber = debtorAddr.buildingNumber;

        console.log("Generating QR with data:", qrData);
        return await generateSwissQRBase64(qrData);
    };

    const handlePreview = async (schedule: any) => {
        try {
            setGeneratingId(schedule.id);
            const pngDataUrl = await generateQRCode(schedule);
            setPreviewUrl(pngDataUrl);
            setPreviewOpen(true);
        } catch (error: any) {
            console.error("QR Error:", error);
            toast.error(error.message || "Failed to generate QR Bill");
        } finally {
            setGeneratingId(null);
        }
    };

    const handleDownload = async (schedule: any) => {
        try {
            setGeneratingId(schedule.id);
            const pngDataUrl = await generateQRCode(schedule);

            const link = document.createElement('a');
            link.href = pngDataUrl;
            link.download = `QR-Bill-${schedule.qr_reference}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("QR Bill downloaded");
        } catch (error: any) {
            console.error("QR Error:", error);
            toast.error(error.message || "Failed to download QR Bill");
        } finally {
            setGeneratingId(null);
        }
    };

    const handleMarkAsPaid = async (scheduleId: string) => {
        try {
            setUpdatingId(scheduleId);

            const result = await confirmPaymentAction(scheduleId, invoice.id);
            if (result.error) throw new Error(result.error);

            toast.success("Marked as paid and recorded in history");
            router.refresh();
        } catch (error: any) {
            console.error("Update Error:", error);
            toast.error(error.message || "Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleMarkAsPending = async (scheduleId: string) => {
        try {
            setUpdatingId(scheduleId);

            // 1. Update schedule status
            const { error: updateError } = await supabase
                .from('invoice_payment_schedules')
                .update({
                    status: 'pending',
                    paid_at: null
                })
                .eq('id', scheduleId);

            if (updateError) throw updateError;

            // 2. Remove from payment history
            const schedule = schedules.find(s => s.id === scheduleId);
            if (schedule) {
                const reference = schedule.qr_reference || `Installment ${schedule.installment_number}`;

                const { error: deleteError } = await supabase
                    .from('invoice_payments')
                    .delete()
                    .eq('invoice_id', invoice.id)
                    .eq('reference', reference);

                if (deleteError) {
                    console.error("Failed to remove payment history:", deleteError);
                    toast.warning("Schedule updated but failed to remove from history");
                } else {
                    toast.success("Marked as pending and removed from history");
                }

                // Sync invoice total
                await syncInvoiceTotal(invoice.id);
            } else {
                toast.success("Marked as pending");
            }

            router.refresh();
        } catch (error) {
            console.error("Update Error:", error);
            toast.error("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };


    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Installment</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                            <TableCell className="font-medium">
                                #{schedule.installment_number} of {schedules.length}
                            </TableCell>
                            <TableCell>
                                {format(new Date(schedule.due_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                                {invoice.currency} {schedule.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {schedule.qr_reference || '-'}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={schedule.status === 'paid' ? 'default' : schedule.status === 'processing' ? 'secondary' : schedule.status === 'overdue' ? 'destructive' : 'outline'}
                                    className={
                                        schedule.status === 'paid' ? 'bg-green-500 hover:bg-green-600' :
                                            schedule.status === 'processing' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''
                                    }
                                >
                                    {schedule.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handlePreview(schedule)} disabled={generatingId === schedule.id}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Preview QR Bill
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDownload(schedule)}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download QR Bill
                                        </DropdownMenuItem>

                                        {schedule.status === 'processing' && (
                                            <>
                                                <DropdownMenuItem onClick={() => handleMarkAsPaid(schedule.id)} disabled={updatingId === schedule.id}>
                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                    Confirm Payment
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleMarkAsPending(schedule.id)} disabled={updatingId === schedule.id}>
                                                    <Clock className="mr-2 h-4 w-4 text-orange-500" />
                                                    Reject (Reset to Pending)
                                                </DropdownMenuItem>
                                            </>
                                        )}

                                        {schedule.status !== 'paid' && schedule.status !== 'processing' && (
                                            <DropdownMenuItem onClick={() => handleMarkAsPaid(schedule.id)} disabled={updatingId === schedule.id}>
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                Mark as Paid
                                            </DropdownMenuItem>
                                        )}

                                        {schedule.status === 'paid' && (
                                            <DropdownMenuItem onClick={() => handleMarkAsPending(schedule.id)} disabled={updatingId === schedule.id}>
                                                <Clock className="mr-2 h-4 w-4" />
                                                Mark as Pending
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* QR Bill Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>QR Bill Preview</DialogTitle>
                    </DialogHeader>
                    {previewUrl && (
                        <div className="flex justify-center p-4 bg-white rounded-lg border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={previewUrl}
                                alt="QR Bill"
                                className="max-w-full h-auto shadow-sm"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
