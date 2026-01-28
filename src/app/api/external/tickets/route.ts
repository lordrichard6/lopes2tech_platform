
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logActivity } from '@/lib/activity';

// Schema for validation
const ticketSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    company: z.string().optional(),
    phone: z.string().optional(),
    message: z.string().min(1),
    context: z.string().optional().default('General'),
});

// Admin client to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        // 1. Verify API Key
        const apiKey = req.headers.get('x-api-key');
        const expectedApiKey = process.env.PLATFORM_API_SECRET || 'fallback_secret_if_not_set';

        // Allow bypassing if PLATFORM_API_SECRET is not set in dev, but in prod it must match
        if (!process.env.PLATFORM_API_SECRET) {
            console.warn('PLATFORM_API_SECRET not set, allowing request for dev...');
        } else if (apiKey !== expectedApiKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Body
        const body = await req.json();
        const validation = ticketSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.format() }, { status: 400 });
        }

        const { name, email, company, phone, message, context } = validation.data;

        // 3. Insert into Supabase
        const { data, error } = await supabaseAdmin
            .from('tickets')
            .insert({
                name,
                email,
                company,
                phone,
                message,
                context,
                status: 'new'
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase Insert Error:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data.id });

        // 4. Log Activity
        await logActivity({
            action: 'document_uploaded', // Best fit for now, or we add a new type 'create_ticket'
            entityType: 'system',
            entityId: data.id,
            metadata: {
                ticket_id: data.id,
                name: name,
                email: email,
                context: context
            }
        });

        return NextResponse.json({ success: true, id: data.id });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function OPTIONS(req: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*', // Adjust for stricter security if needed e.g. 'https://lopes2tech.ch'
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
        },
    });
}
