import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { SwissQRBill } from 'swissqrbill/pdf';
import PDFDocument from 'pdfkit';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; installment: string }> }
) {
    try {
        const { id: invoiceId, installment: installmentNumber } = await params;
        const supabase = await createClient();
        const adminClient = createAdminClient();

        // Fetch invoice with client
        const { data: invoice } = await supabase
            .from('invoices')
            .select('*, clients(*)')
            .eq('id', invoiceId)
            .single();

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Fetch the specific installment
        const { data: schedule } = await supabase
            .from('invoice_payment_schedules')
            .select('*')
            .eq('invoice_id', invoiceId)
            .eq('installment_number', parseInt(installmentNumber))
            .single();

        if (!schedule) {
            return NextResponse.json({ error: 'Installment not found' }, { status: 404 });
        }

        // Fetch system settings for payment info (Use adminClient to bypass RLS)
        const { data: settings } = await adminClient
            .from('system_settings')
            .select('*')
            .single();

        // Get total installments count
        const { count: totalInstallments } = await supabase
            .from('invoice_payment_schedules')
            .select('*', { count: 'exact', head: true })
            .eq('invoice_id', invoiceId);

        // Generate QR Bill using server-side PDF generation
        let qrBillPdf = null;
        const accountNumber = settings?.qr_iban || settings?.iban;
        if (accountNumber) {
            try {
                const client = invoice.clients || {};

                // Parse addresses
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
                    }
                };

                if (creditorAddr.buildingNumber) qrData.creditor.buildingNumber = creditorAddr.buildingNumber;
                if (debtorAddr.buildingNumber) qrData.debtor.buildingNumber = debtorAddr.buildingNumber;
                if (schedule.qr_reference) qrData.reference = schedule.qr_reference;
                if (schedule.qr_reference) qrData.message = `Payment ${schedule.installment_number}/${totalInstallments}`;

                // Create PDF Document using PDFKit
                const doc = new PDFDocument({ size: 'A4', autoFirstPage: true });
                const qrBill = new SwissQRBill(qrData);

                // Collect chunks
                const chunks: Buffer[] = [];
                doc.on('data', (chunk: Buffer) => chunks.push(chunk));

                // Attach QR Bill
                qrBill.attachTo(doc);
                doc.end();

                // Wait for stream to finish
                qrBillPdf = await new Promise<Buffer>((resolve, reject) => {
                    doc.on('end', () => resolve(Buffer.concat(chunks)));
                    doc.on('error', reject);
                });
            } catch (e) {
                console.error('Failed to generate QR Bill:', e);
            }
        }

        // If QR PDF was generated, return it directly
        // If QR PDF was generated, return it directly
        if (qrBillPdf) {
            // Fix Buffer type compat by converting to Uint8Array/Blob
            const pdfBlob = new Blob([new Uint8Array(qrBillPdf)], { type: 'application/pdf' });

            return new NextResponse(pdfBlob, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `inline; filename="QR-Bill-${schedule.qr_reference}.pdf"`,
                },
            });
        }

        // Fallback error if QR bill generation failed
        return NextResponse.json({ error: 'QR IBAN not configured or generation failed' }, { status: 500 });
    } catch (error) {
        console.error('Error generating QR bill:', error);
        return NextResponse.json({ error: 'Failed to generate QR bill' }, { status: 500 });
    }
}
