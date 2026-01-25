"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateSwissQRBase64 } from "@/lib/pdf/generate-qr-bill";

interface DownloadQRButtonProps {
    schedule: {
        amount: number;
        installment_number: number;
        qr_reference?: string;
    };
    invoice: {
        currency: string;
        description?: string;
        clients: {
            name?: string;
            address?: string;
            zip?: string;
            city?: string;
            country?: string;
        };
    };
    settings: {
        qr_iban?: string;
        iban?: string;
        creditor_street?: string;
        account_holder?: string;
        creditor_zip?: string;
        creditor_city?: string;
        creditor_country?: string;
    };
}

export function DownloadQRButton({ schedule, invoice, settings }: DownloadQRButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const accountNumber = settings?.qr_iban || settings?.iban;

            if (!accountNumber) {
                throw new Error("Payment configuration missing (IBAN)");
            }

            const client = invoice.clients;

            // Parse addresses (same logic as Admin)
            const parseAddress = (addr: string) => {
                const match = addr?.match(/^(.+?)\s+(\d+)$/);
                return match ? { street: match[1], buildingNumber: parseInt(match[2]) } : { street: addr || '' };
            };

            const creditorAddr = parseAddress(settings.creditor_street || '');
            const debtorAddr = parseAddress(client.address || '');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

            console.log("Generating Client QR with data:", qrData);
            const pngDataUrl = await generateSwissQRBase64(qrData);

            // Create download link
            const link = document.createElement('a');
            link.href = pngDataUrl;
            link.download = `QR-Bill-${schedule.qr_reference || 'payment'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('QR Bill downloaded successfully');
        } catch (error: unknown) {
            console.error('Error generating QR bill:', error);
            toast.error((error as Error).message || 'Failed to generate QR bill');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isLoading}
            className="gap-2 h-8"
        >
            {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <Download className="h-3 w-3" />
            )}
            QR Bill
        </Button>
    );
}
