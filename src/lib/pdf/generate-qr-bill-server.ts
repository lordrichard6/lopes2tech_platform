import { SwissQRBill } from 'swissqrbill/pdf';
import PDFDocument from 'pdfkit';

export interface SwissQRBillData {
    currency: 'CHF' | 'EUR';
    amount: number;
    reference?: string;
    creditor: {
        name: string;
        address: string;
        zip: string;
        city: string;
        country: string;
        account: string;
    };
    debtor: {
        name: string;
        address: string;
        zip: string;
        city: string;
        country: string;
        account: string;
    };
    message?: string;
}

export function generateQRBill(data: SwissQRBillData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4' });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));

            const qrBill = new SwissQRBill(data);

            // Attach QR Bill to PDF (at bottom)
            qrBill.attachTo(doc);

            doc.end();

        } catch (error) {
            console.error('Failed to generate Swiss QR Bill PDF:', error);
            reject(error);
        }
    });
}
