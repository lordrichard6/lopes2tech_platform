"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { pdf } from '@react-pdf/renderer';
import { OfferPDFDocument } from '@/lib/pdf/offer-template';
import { generateSwissQRBase64 } from '@/lib/pdf/generate-qr-bill';

interface DownloadPdfButtonProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invoice: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    settings: any;
}

export function DownloadPdfButton({ invoice, settings }: DownloadPdfButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        try {
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

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pdfData: any = {
                offerNumber: invoice.id.slice(0, 8).toUpperCase(),
                offerDate: new Date(invoice.created_at).toLocaleDateString(), // Template uses offerDate
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
                            price: { CHF: invoice.amount, EUR: invoice.amount }, // Handles both currencies
                            category: 'other'
                        },
                        quantity: 1,
                        customPrice: invoice.amount
                    }
                ],
                // Template typically supports these:
                date: new Date(invoice.created_at).toLocaleDateString(),
                status: invoice.status,
                paymentMethod: qrBillImage ? 'QR_BILL' : undefined,
                qrBillImage: qrBillImage || undefined,
            };

            const blob = await pdf(<OfferPDFDocument data={pdfData} />).toBlob();
            const url = URL.createObjectURL(blob);

            // Open in new tab (View PDF)
            window.open(url, '_blank');

            toast.success('PDF generated');

        } catch (error: unknown) {
            console.error('Error generating PDF:', error);
            toast.error((error as Error).message || 'Failed to generate PDF');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            className="w-full sm:w-auto gap-2"
            onClick={handleDownload}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            Download PDF
        </Button>
    );
}
