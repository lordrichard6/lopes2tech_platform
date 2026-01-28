"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Copy, Clock, MoreVertical, ExternalLink, FileText, Mail, Loader2, CheckCircle, XCircle, Pencil, Plus
} from "lucide-react";
import { pdf } from '@react-pdf/renderer';
import { OfferPDFDocument } from '@/lib/pdf/offer-template';
import { generateSwissQRBase64 } from '@/lib/pdf/generate-qr-bill';
import { EditInvoiceDialog } from "../edit-invoice-dialog";
import { RecordPaymentDialog } from "../record-payment-dialog";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InvoiceActionsProps {
    invoice: any;
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLoadingPdf, setIsLoadingPdf] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isMarkingPaid, setIsMarkingPaid] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const router = useRouter();

    const handleEditClose = (open: boolean) => {
        setIsEditOpen(open);
        if (!open) {
            router.refresh();
        }
    };

    const isPaid = invoice.status === 'paid';
    const isCancelled = invoice.status === 'cancelled';
    const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && !isPaid;

    // View PDF (Generated Client-Side)
    const handleViewPdf = async () => {
        setIsLoadingPdf(true);
        try {
            const supabase = createClient();

            // Fetch system settings for QR bill
            const { data: settings } = await supabase
                .from('system_settings')
                .select('*')
                .single();

            const accountNumber = settings?.qr_iban || settings?.iban;

            let qrBillImage = null;

            // Generate QR Bill if IBAN is configured
            if (accountNumber && invoice.clients) {
                const parseAddress = (addr: string) => {
                    const match = addr?.match(/^(.+?)\s+(\d+)$/);
                    return match ? { street: match[1], buildingNumber: parseInt(match[2]) } : { street: addr || '' };
                };

                const creditorAddr = parseAddress(settings.creditor_street || '');
                const debtorAddr = parseAddress(invoice.clients.address || '');

                const qrData: any = {
                    currency: invoice.currency === 'EUR' ? 'EUR' : 'CHF',
                    amount: invoice.amount,
                    creditor: {
                        name: settings.account_holder || 'Lopes2Tech',
                        account: accountNumber,
                        address: creditorAddr.street,
                        zip: parseInt(settings.creditor_zip || '8000'),
                        city: settings.creditor_city || 'Zurich',
                        country: (settings.creditor_country && settings.creditor_country.length === 2) ? settings.creditor_country : 'CH'
                    },
                    debtor: {
                        name: invoice.clients.name || 'Client',
                        address: debtorAddr.street,
                        zip: parseInt(invoice.clients.zip || '8000'),
                        city: invoice.clients.city || 'Zurich',
                        country: (invoice.clients.country && invoice.clients.country.length === 2) ? invoice.clients.country : 'CH'
                    },
                    reference: '', // Empty reference is valid for regular IBAN
                    message: `Invoice ${invoice.id.slice(0, 8).toUpperCase()} - ${invoice.description || 'Payment'}`
                };

                if (creditorAddr.buildingNumber) qrData.creditor.buildingNumber = creditorAddr.buildingNumber;
                if (debtorAddr.buildingNumber) qrData.debtor.buildingNumber = debtorAddr.buildingNumber;

                qrBillImage = await generateSwissQRBase64(qrData);
            }

            // Construct PDF Item from Invoice
            const pdfData: any = {
                offerNumber: invoice.id.slice(0, 8).toUpperCase(),
                date: new Date(invoice.created_at).toLocaleDateString(),
                validUntil: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Due on Receipt',
                clientName: invoice.clients?.name || 'Valued Client',
                clientEmail: invoice.clients?.contact_email,
                currency: invoice.currency,
                language: 'EN',
                title: 'INVOICE',
                items: [
                    {
                        service: {
                            id: 'custom',
                            name: invoice.description || 'Services Rendered',
                            description: invoice.project_id ? `Project: ${invoice.projects?.name}` : undefined,
                            price: { CHF: invoice.amount, EUR: invoice.amount },
                            category: 'other'
                        },
                        quantity: 1,
                        customPrice: invoice.amount
                    }
                ],
                paymentMethod: qrBillImage ? 'QR_BILL' : undefined,
                qrBillImage: qrBillImage || undefined,
            };

            const blob = await pdf(<OfferPDFDocument data={pdfData} />).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');

        } catch (error) {
            console.error('Error fetching PDF:', error);
            toast.error('Failed to load PDF');
        } finally {
            setIsLoadingPdf(false);
        }
    };

    // Send Invoice via Email
    const handleSendInvoice = async () => {
        setIsSending(true);
        try {
            const response = await fetch('/api/invoices/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceId: invoice.id,
                    clientEmail: invoice.clients?.contact_email,
                    clientName: invoice.clients?.name,
                }),
            });

            if (response.ok) {
                toast.success('Invoice sent to ' + invoice.clients?.contact_email);
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            console.error('Error sending invoice:', error);
            toast.error('Failed to send invoice. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    // Mark as Fully Paid
    const handleMarkAsPaid = async () => {
        setIsMarkingPaid(true);
        try {
            const supabase = createClient();
            const remainingAmount = invoice.amount - (invoice.amount_paid || 0);

            // Record a final payment
            await supabase.from('invoice_payments').insert({
                invoice_id: invoice.id,
                amount: remainingAmount,
                payment_method: 'manual',
                notes: 'Marked as paid by admin',
                payment_date: new Date().toISOString(),
            });

            // Update invoice status
            await supabase
                .from('invoices')
                .update({
                    status: 'paid',
                    amount_paid: invoice.amount
                })
                .eq('id', invoice.id);

            toast.success('Invoice marked as paid');
            router.refresh();
        } catch (error) {
            console.error('Error marking as paid:', error);
            toast.error('Failed to update invoice');
        } finally {
            setIsMarkingPaid(false);
        }
    };

    // Cancel Invoice
    const handleCancelInvoice = async () => {
        setIsCancelling(true);
        try {
            const supabase = createClient();

            await supabase
                .from('invoices')
                .update({ status: 'cancelled' })
                .eq('id', invoice.id);

            toast.success('Invoice cancelled');
            setShowCancelDialog(false);
            router.refresh();
        } catch (error) {
            console.error('Error cancelling invoice:', error);
            toast.error('Failed to cancel invoice');
        } finally {
            setIsCancelling(false);
        }
    };

    // Duplicate Invoice
    const handleDuplicate = async () => {
        try {
            const supabase = createClient();

            const { data: newInvoice, error } = await supabase
                .from('invoices')
                .insert({
                    client_id: invoice.client_id,
                    project_id: invoice.project_id,
                    amount: invoice.amount,
                    currency: invoice.currency,
                    description: invoice.description,
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    status: 'pending',
                })
                .select()
                .single();

            if (newInvoice) {
                toast.success('Invoice duplicated');
                router.push(`/admin/invoices/${newInvoice.id}`);
            }
        } catch (error) {
            console.error('Error duplicating:', error);
            toast.error('Failed to duplicate invoice');
        }
    };

    // Send Reminder
    const handleSendReminder = async () => {
        setIsSending(true);
        try {
            const response = await fetch('/api/invoices/reminder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceId: invoice.id,
                    clientEmail: invoice.clients?.contact_email,
                    clientName: invoice.clients?.name,
                    amount: invoice.amount - (invoice.amount_paid || 0),
                    currency: invoice.currency,
                    dueDate: invoice.due_date,
                }),
            });

            if (response.ok) {
                toast.success('Reminder sent');
            } else {
                throw new Error('Failed to send reminder');
            }
        } catch (error) {
            console.error('Error sending reminder:', error);
            toast.error('Failed to send reminder');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                {/* Actions Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4 mr-2" />
                            Actions
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        {/* Primary Actions */}
                        <DropdownMenuItem onClick={handleViewPdf} disabled={isLoadingPdf}>
                            {isLoadingPdf ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <FileText className="mr-2 h-4 w-4" />
                            )}
                            View PDF
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={handleSendInvoice}
                            disabled={isSending || !invoice.clients?.contact_email}
                        >
                            {isSending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Mail className="mr-2 h-4 w-4" />
                            )}
                            Send Invoice
                        </DropdownMenuItem>

                        {!isPaid && !isCancelled && (
                            <>
                                <RecordPaymentDialog
                                    invoiceId={invoice.id}
                                    invoiceAmount={invoice.amount}
                                    amountPaid={invoice.amount_paid || 0}
                                    currency={invoice.currency}
                                    trigger={
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Record Payment
                                        </DropdownMenuItem>
                                    }
                                />
                                <DropdownMenuItem
                                    onClick={handleMarkAsPaid}
                                    disabled={isMarkingPaid}
                                    className="text-green-600"
                                >
                                    {isMarkingPaid ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                    )}
                                    Mark as Paid
                                </DropdownMenuItem>
                            </>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Invoice
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={handleDuplicate}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate Invoice
                        </DropdownMenuItem>

                        {isOverdue && !isPaid && !isCancelled && (
                            <DropdownMenuItem onClick={handleSendReminder} disabled={isSending}>
                                <Clock className="mr-2 h-4 w-4" />
                                Send Reminder
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        {!isPaid && !isCancelled && (
                            <DropdownMenuItem
                                onClick={() => setShowCancelDialog(true)}
                                className="text-destructive focus:text-destructive"
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Invoice
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Edit Dialog */}
            <EditInvoiceDialog
                invoice={invoice}
                open={isEditOpen}
                onOpenChange={handleEditClose}
            />

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Invoice?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will mark the invoice as cancelled. The client will no longer be able to pay this invoice. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Invoice</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelInvoice}
                            disabled={isCancelling}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Cancel Invoice
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
