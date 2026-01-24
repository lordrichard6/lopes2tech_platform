import { SwissQRBill } from 'swissqrbill/svg';

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

function parseAddress(fullAddress: string): { street: string; buildingNumber?: number } {
    const match = fullAddress.match(/^(.+?)\s+(\d+)$/);
    if (match) {
        return { street: match[1], buildingNumber: parseInt(match[2]) };
    }
    return { street: fullAddress };
}

export function generateSwissQRRaw(data: SwissQRBillData): SVGElement {
    try {
        const creditorAddr = parseAddress(data.creditor.address);
        const debtorAddr = parseAddress(data.debtor.address);

        const qrData: any = {
            currency: data.currency,
            amount: data.amount,
            creditor: {
                name: data.creditor.name,
                account: data.creditor.account,
                address: creditorAddr.street,
                zip: parseInt(data.creditor.zip) || 8000,
                city: data.creditor.city,
                country: data.creditor.country
            },
            debtor: {
                name: data.debtor.name,
                address: debtorAddr.street,
                zip: parseInt(data.debtor.zip) || 8000,
                city: data.debtor.city,
                country: data.debtor.country
            }
        };

        if (creditorAddr.buildingNumber) {
            qrData.creditor.buildingNumber = creditorAddr.buildingNumber;
        }
        if (debtorAddr.buildingNumber) {
            qrData.debtor.buildingNumber = debtorAddr.buildingNumber;
        }

        if (data.reference && data.reference.trim()) {
            qrData.reference = data.reference.trim();
        }

        if (data.message) {
            qrData.message = data.message;
        }

        console.log('Generating Swiss QR Bill with data:', qrData);

        const qrBill = new SwissQRBill(qrData);
        console.log('Swiss QR Bill generated successfully');
        return qrBill.element;
    } catch (error) {
        console.error('Failed to generate Swiss QR Bill:', error);
        throw error;
    }
}

export function generateSwissQRBase64(data: SwissQRBillData): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const element = generateSwissQRRaw(data);
            const svgString = element.outerHTML;

            const img = new Image();
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const width = 600;
                const height = 300;

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                const pngDataUrl = canvas.toDataURL('image/png');
                URL.revokeObjectURL(url);

                console.log('Swiss QR Bill converted to PNG successfully');
                resolve(pngDataUrl);
            };

            img.onerror = (error) => {
                URL.revokeObjectURL(url);
                console.error('Failed to load SVG image:', error);
                reject(new Error('Failed to load SVG image'));
            };

            img.src = url;
        } catch (error) {
            console.error('Failed to convert Swiss QR Bill to PNG:', error);
            reject(error);
        }
    });
}
