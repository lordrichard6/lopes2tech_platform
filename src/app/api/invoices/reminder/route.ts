import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const { invoiceId, clientEmail, clientName, amount, currency, dueDate } = await request.json();

        if (!invoiceId || !clientEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A';
        const daysOverdue = dueDate ? Math.floor((Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

        // Send reminder email
        const { data, error } = await resend.emails.send({
            from: 'Lopes2Tech <invoices@lopes2tech.ch>',
            to: clientEmail,
            subject: `Payment Reminder: Invoice #${invoiceId.slice(0, 8).toUpperCase()}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Payment Reminder</h2>
                    <p>Dear ${clientName || 'Client'},</p>
                    <p>This is a friendly reminder that your invoice is ${daysOverdue > 0 ? `<strong>${daysOverdue} days overdue</strong>` : 'due soon'}.</p>
                    
                    <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                        <p style="margin: 0; color: #666;">Outstanding Balance:</p>
                        <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #dc2626;">
                            ${currency} ${amount?.toLocaleString() || '0'}
                        </p>
                        <p style="margin: 0; color: #666; font-size: 14px;">Original due date: ${formattedDueDate}</p>
                    </div>

                    <p>Please make your payment at your earliest convenience:</p>
                    <a href="${appUrl}/dashboard/invoices/${invoiceId}" 
                       style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 10px 0;">
                        Pay Now
                    </a>

                    <p style="color: #666; margin-top: 20px;">
                        If you have already made a payment, please disregard this reminder. 
                        If you have any questions, please don't hesitate to contact us.
                    </p>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="color: #666; font-size: 12px;">
                        Lopes2Tech • Zurich, Switzerland<br/>
                        paulo@lopes2tech.ch
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Email send error:', error);
            return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
        }

        return NextResponse.json({ success: true, messageId: data?.id });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
