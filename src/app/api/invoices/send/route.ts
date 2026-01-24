import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const { invoiceId, clientEmail, clientName } = await request.json();

        if (!invoiceId || !clientEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = await createClient();

        // Fetch invoice details
        const { data: invoice } = await supabase
            .from('invoices')
            .select('*, clients(name)')
            .eq('id', invoiceId)
            .single();

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Fetch the invoice PDF document
        const { data: docs } = await supabase
            .from('documents')
            .select('file_path')
            .eq('client_id', invoice.client_id)
            .eq('document_type', 'invoice')
            .order('created_at', { ascending: false })
            .limit(1);

        let pdfAttachment = null;
        if (docs?.[0]?.file_path) {
            const { data: fileData } = await supabase.storage
                .from('documents')
                .download(docs[0].file_path);

            if (fileData) {
                const buffer = await fileData.arrayBuffer();
                pdfAttachment = {
                    filename: `Invoice-${invoiceId.slice(0, 8)}.pdf`,
                    content: Buffer.from(buffer),
                };
            }
        }

        const invoiceNumber = invoice.description?.match(/INV-[\w-]+/)?.[0] || `INV-${invoiceId.slice(0, 8).toUpperCase()}`;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Send email
        const { data, error } = await resend.emails.send({
            from: 'Lopes2Tech <invoices@lopes2tech.ch>',
            to: clientEmail,
            subject: `Invoice ${invoiceNumber} from Lopes2Tech`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0891b2;">Invoice from Lopes2Tech</h2>
                    <p>Dear ${clientName || 'Client'},</p>
                    <p>Please find attached your invoice <strong>${invoiceNumber}</strong>.</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #666;">Amount Due:</p>
                        <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #0891b2;">
                            ${invoice.currency} ${invoice.amount.toLocaleString()}
                        </p>
                        ${invoice.due_date ? `<p style="margin: 0; color: #666; font-size: 14px;">Due by: ${new Date(invoice.due_date).toLocaleDateString()}</p>` : ''}
                    </div>

                    <p>You can view and pay this invoice online:</p>
                    <a href="${appUrl}/dashboard/invoices/${invoiceId}" 
                       style="display: inline-block; background: #0891b2; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 10px 0;">
                        View Invoice
                    </a>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="color: #666; font-size: 12px;">
                        Lopes2Tech • Zurich, Switzerland<br/>
                        paulo@lopes2tech.ch
                    </p>
                </div>
            `,
            attachments: pdfAttachment ? [pdfAttachment] : undefined,
        });

        if (error) {
            console.error('Email send error:', error);
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true, messageId: data?.id });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
