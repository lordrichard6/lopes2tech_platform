import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    if (!stripe) {
        return new NextResponse('Stripe is not configured', { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { invoiceId } = await req.json();

    const { data: invoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

    if (!invoice) {
        return new NextResponse('Invoice not found', { status: 404 });
    }

    // Create Stripe Checkout Session
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: invoice.currency.toLowerCase(),
                        product_data: {
                            name: `Invoice #${invoice.id.slice(0, 8)}`,
                            description: invoice.description || 'Professional Services',
                        },
                        unit_amount: Math.round(invoice.amount * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invoices/${invoice.id}?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invoices/${invoice.id}?canceled=true`,
            metadata: {
                invoiceId: invoice.id,
                userId: user.id
            }
        });

        // Optionally save session ID to invoice to track
        // await supabase.from('invoices').update({ stripe_payment_intent_id: session.id }).eq('id', invoiceId)

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Error:', error);
        return new NextResponse(error.message, { status: 500 });
    }
}
