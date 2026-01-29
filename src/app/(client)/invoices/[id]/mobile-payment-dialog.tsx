"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Loader2, CheckCircle2, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { toast } from "sonner";
import { pdf } from '@react-pdf/renderer';
import { OfferPDFDocument } from '@/lib/pdf/offer-template';
import { generateSwissQRBase64 } from '@/lib/pdf/generate-qr-bill';
import { markScheduleProcessingAction } from "../actions";
import { useRouter } from "next/navigation";

interface Schedule {
    id: string;
    installment_number: number;
    amount: number;
    due_date: string;
    status: string;
    qr_reference?: string;
}

interface MobilePaymentDialogProps {
    invoice: any;
    schedules: Schedule[];
    settings: any;
}

export function MobilePaymentDialog({ invoice, schedules, settings }: MobilePaymentDialogProps) {
    const { t, locale } = useLanguage();
    const [open, setOpen] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [downloadingQR, setDownloadingQR] = useState<string | null>(null);
    const [markingPaid, setMarkingPaid] = useState<string | null>(null);
    const router = useRouter();

    const handleDownloadPdf = async () => {
        setDownloadingPdf(true);
        try {
            const accountNumber = settings?.qr_iban || settings?.iban;
            let qrBillImage = null;

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
                    reference: '',
                    message: `Invoice ${invoice.id.slice(0, 8).toUpperCase()} - ${invoice.description || 'Payment'}`
                };

                if (creditorAddr.buildingNumber) qrData.creditor.buildingNumber = creditorAddr.buildingNumber;
                if (debtorAddr.buildingNumber) qrData.debtor.buildingNumber = debtorAddr.buildingNumber;

                qrBillImage = await generateSwissQRBase64(qrData);
            }

            const pdfData: any = {
                offerNumber: invoice.id.slice(0, 8).toUpperCase(),
                offerDate: new Date(invoice.created_at).toLocaleDateString(),
                validUntil: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Due on Receipt',
                clientName: invoice.clients?.name || 'Valued Client',
                clientEmail: invoice.clients?.contact_email,
                currency: invoice.currency,
                language: 'EN',
                title: 'INVOICE',
                items: [{
                    service: {
                        id: 'custom',
                        name: invoice.description || 'Services Rendered',
                        description: invoice.project_id ? `Project: ${invoice.projects?.name}` : undefined,
                        price: { CHF: invoice.amount, EUR: invoice.amount },
                        category: 'other'
                    },
                    quantity: 1,
                    customPrice: invoice.amount
                }],
                date: new Date(invoice.created_at).toLocaleDateString(),
                status: invoice.status,
                paymentMethod: qrBillImage ? 'QR_BILL' : undefined,
                qrBillImage: qrBillImage || undefined,
            };

            const blob = await pdf(<OfferPDFDocument data={pdfData} />).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            toast.success('PDF generated');
        } catch (error: unknown) {
            console.error('Error generating PDF:', error);
            toast.error((error as Error).message || 'Failed to generate PDF');
        } finally {
            setDownloadingPdf(false);
        }
    };

    const handleDownloadQR = async (schedule: Schedule) => {
        setDownloadingQR(schedule.id);
        try {
            const accountNumber = settings?.qr_iban || settings?.iban;
            if (!accountNumber) throw new Error("Payment configuration missing (IBAN)");

            const client = invoice.clients;
            const parseAddress = (addr: string) => {
                const match = addr?.match(/^(.+?)\s+(\d+)$/);
                return match ? { street: match[1], buildingNumber: parseInt(match[2]) } : { street: addr || '' };
            };

            const creditorAddr = parseAddress(settings.creditor_street || '');
            const debtorAddr = parseAddress(client.address || '');

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
                message: `Payment ${schedule.installment_number} - ${invoice.description || 'Service Invoice'}`
            };

            if (creditorAddr.buildingNumber) qrData.creditor.buildingNumber = creditorAddr.buildingNumber;
            if (debtorAddr.buildingNumber) qrData.debtor.buildingNumber = debtorAddr.buildingNumber;

            const pngDataUrl = await generateSwissQRBase64(qrData);
            const link = document.createElement('a');
            link.href = pngDataUrl;
            link.download = `QR-Bill-${schedule.qr_reference || 'payment'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('QR Bill downloaded');
        } catch (error: unknown) {
            console.error('Error generating QR bill:', error);
            toast.error((error as Error).message || 'Failed to generate QR bill');
        } finally {
            setDownloadingQR(null);
        }
    };

    const handleMarkPaid = async (scheduleId: string) => {
        setMarkingPaid(scheduleId);
        try {
            const result = await markScheduleProcessingAction(scheduleId);
            if (result.error) throw new Error(result.error);
            toast.success('Payment marked as processing');
            router.refresh();
        } catch (error: any) {
            console.error('Error marking as paid:', error);
            toast.error(error.message || 'Failed to update status');
        } finally {
            setMarkingPaid(null);
        }
    };

    const statusBadgeClass = (status: string) => {
        if (status === 'paid') return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
        if (status === 'processing') return 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300';
        return '';
    };

    const unpaidSchedules = schedules.filter(s => s.status !== 'paid');
    const hasUnpaidInstallments = unpaidSchedules.length > 0;

    return (
        <>
            {/* Fixed FAB - mobile only */}
            <Button
                size="lg"
                className="fixed bottom-6 right-6 z-50 h-14 px-6 rounded-2xl shadow-lg shadow-primary/25 md:hidden gap-2"
                onClick={() => setOpen(true)}
            >
                <CreditCard className="h-5 w-5" />
                {t.invoices.details.pay}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[400px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg">{t.invoices.details.pay}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        {/* Download Invoice */}
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 h-12"
                            onClick={handleDownloadPdf}
                            disabled={downloadingPdf}
                        >
                            {downloadingPdf ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Download className="h-5 w-5" />
                            )}
                            <span>Download Invoice</span>
                        </Button>

                        {/* Installments */}
                        {schedules.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                    {t.invoices.details.paymentSchedule}
                                </h4>
                                {schedules.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className="bg-muted/30 rounded-lg p-3 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">
                                                #{schedule.installment_number} / {schedules.length}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] ${statusBadgeClass(schedule.status)}`}
                                            >
                                                {schedule.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                                                {t.invoices.statusMap[schedule.status as keyof typeof t.invoices.statusMap] || schedule.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-bold">
                                                {invoice.currency} {schedule.amount.toLocaleString()}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {t.invoices.due}: {new Date(schedule.due_date).toLocaleDateString(
                                                    locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'de-CH'
                                                )}
                                            </span>
                                        </div>

                                        {schedule.status !== 'paid' && (
                                            <div className="flex gap-2 pt-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 gap-1.5 h-9 text-xs"
                                                    onClick={() => handleDownloadQR(schedule)}
                                                    disabled={downloadingQR === schedule.id}
                                                >
                                                    {downloadingQR === schedule.id ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Download className="h-3.5 w-3.5" />
                                                    )}
                                                    QR Bill
                                                </Button>

                                                {schedule.status === 'processing' ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="flex-1 justify-center bg-amber-100 text-amber-800 gap-1 h-9"
                                                    >
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {t.invoices.details.pendingVerification}
                                                    </Badge>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 gap-1.5 h-9 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                                        onClick={() => handleMarkPaid(schedule.id)}
                                                        disabled={markingPaid === schedule.id}
                                                    >
                                                        {markingPaid === schedule.id ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                        )}
                                                        {t.invoices.details.pay}
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
