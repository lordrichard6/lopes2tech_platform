import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { token, signatureName } = await request.json();

        if (!token || !signatureName) {
            return NextResponse.json(
                { error: 'Token and signature name are required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Find document by token
        const { data: doc, error: fetchError } = await supabase
            .from('documents')
            .select(`
                id,
                name,
                status,
                client_id,
                clients!inner (
                    name,
                    contact_email
                )
            `)
            .eq('acceptance_token', token)
            .single();

        if (fetchError || !doc) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        // Check if already signed
        if (doc.status === 'signed') {
            return NextResponse.json(
                { error: 'Document has already been signed' },
                { status: 400 }
            );
        }

        // Get client info from request
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Update document with signature
        const { error: updateError } = await supabase
            .from('documents')
            .update({
                status: 'signed',
                signature_name: signatureName,
                signature_date: new Date().toISOString(),
                signature_ip: ip,
                signature_user_agent: userAgent,
                signed_at: new Date().toISOString(),
            })
            .eq('id', doc.id);

        if (updateError) {
            return NextResponse.json(
                { error: 'Failed to save signature' },
                { status: 500 }
            );
        }

        // Send confirmation email to client
        const clientEmail = (doc.clients as { contact_email: string })?.contact_email;
        if (clientEmail) {
            const confirmationHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1e293b;">Document Signed Successfully</h2>
                    <p>Hello,</p>
                    <p>Thank you for signing <strong>${doc.name}</strong>.</p>
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <p style="margin: 0; color: #166534;"><strong>Signature Details:</strong></p>
                        <p style="margin: 8px 0 0 0; color: #15803d;">
                            Signed by: ${signatureName}<br/>
                            Date: ${new Date().toLocaleString()}
                        </p>
                    </div>
                    <p>A copy of the signed document will be kept in your client portal for your records.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                    <p style="color: #94a3b8; font-size: 12px;">
                        Lopes2Tech • Zurich, Switzerland • www.lopes2tech.ch
                    </p>
                </div>
            `;

            await sendEmail({
                to: clientEmail,
                subject: `Document Signed: ${doc.name}`,
                html: confirmationHtml,
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Document acceptance error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
