import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { clientId, fileName, fileData, offerNumber, documentType } = await request.json();

        if (!clientId || !fileName || !fileData) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = await createClient();

        // Decode base64 to buffer
        const buffer = Buffer.from(fileData, 'base64');
        const fileSize = buffer.length;

        // Generate unique file path
        const filePath = `clients/${clientId}/offers/${Date.now()}-${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, buffer, {
                contentType: 'application/pdf',
                upsert: false,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
        }

        // Insert document record
        // Schema requires: client_id, name, file_path, size, type (MIME), document_type (category)
        const { data: docData, error: docError } = await supabase
            .from('documents')
            .insert({
                client_id: clientId,
                name: fileName,
                file_path: filePath,
                type: 'application/pdf',
                size: fileSize,
                document_type: documentType || 'proposal',
                status: 'draft'
            })
            .select()
            .single();

        if (docError) {
            console.error('Document record error:', docError);
            return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 });
        }

        return NextResponse.json({ success: true, document: docData });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
