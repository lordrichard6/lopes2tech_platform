import { createClient } from '@/lib/supabase/server';
import { generateQRBill } from '@/lib/pdf/generate-qr-bill';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
    const { id, scheduleId } = await params;

    try {
        const supabase = await createClient();

        // 1. Fetch Schedule with Invoice and Client data
        const { data: schedule, error } = await supabase
            .from('invoice_payment_schedules')
            .select(`
                *,
                invoices!inner (
                    *,
                    clients!inner (*)
                )
            `)
            .eq('id', scheduleId)
            .eq('invoice_id', id)
            .single();

        if (error || !schedule) {
            console.error('Schedule fetch error:', error);
            return new NextResponse('Schedule not found', { status: 404 });
        }

        const invoice = schedule.invoices;
        // @ts-ignore
        const client = invoice.clients;

        // 2. Generate QR PDF
        const pdfBuffer = await generateQRBill({
            amount: schedule.amount,
            currency: invoice.currency,
            reference: schedule.qr_reference,
            debtor: {
                name: client.name,
                address: client.billing_address || '',
                zip: client.billing_zip || '',
                city: client.billing_city || '',
                country: client.billing_country || 'CH',
            },
            message: `Installment #${schedule.installment_number} for Invoice ${invoice.description || invoice.id}`,
        });

        // 3. Return PDF
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="QR_Inst_${schedule.installment_number}_${schedule.qr_reference}.pdf"`,
            },
        });

    } catch (error) {
        console.error('QR Generation Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
