
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
    source: z.string().optional(),
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
        if (apiKey !== process.env.PLATFORM_API_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = ticketSchema.parse(body);

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data, error } = await supabase
            .from('tickets')
            .insert([
                {
                    name: validatedData.name,
                    email: validatedData.email,
                    company: validatedData.company,
                    phone: validatedData.phone,
                    message: validatedData.message,
                    context: validatedData.context,
                    source: validatedData.source || 'external_api',
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Supabase Insert Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Log the activity
        await logActivity({
            action: 'create_ticket',
            entityType: 'ticket',
            entityId: data.id,
            metadata: {
                name: validatedData.name,
                email: validatedData.email,
                source: validatedData.source
            }
        });

        return NextResponse.json({ success: true, data });
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
