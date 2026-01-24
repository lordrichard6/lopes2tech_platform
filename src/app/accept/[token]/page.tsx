import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { DocumentAcceptanceForm } from "./acceptance-form";

export const dynamic = 'force-dynamic';

export default async function DocumentAcceptancePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    const supabase = await createClient();

    // Fetch document by acceptance token
    const { data: doc, error } = await supabase
        .from('documents')
        .select(`
            id,
            name,
            file_path,
            status,
            signature_name,
            signature_date,
            client_id,
            clients!inner (
                name,
                contact_email
            )
        `)
        .eq('acceptance_token', token)
        .single();

    if (error || !doc) {
        notFound();
    }

    // Generate signed URL for document preview
    const { data: urlData } = await supabase.storage
        .from('client-documents')
        .createSignedUrl(doc.file_path, 60 * 60); // 1 hour

    const documentUrl = urlData?.signedUrl || null;

    // Check if already signed
    const isAlreadySigned = doc.status === 'signed' && doc.signature_name;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-12 px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Lopes<span className="text-blue-600">2</span>Tech
                    </h1>
                    <p className="text-gray-500 mt-2">Document Acceptance Portal</p>
                </div>

                {isAlreadySigned ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-green-800 mb-2">Document Already Signed</h2>
                        <p className="text-green-700">
                            This document was signed by <strong>{doc.signature_name}</strong> on{' '}
                            {new Date(doc.signature_date).toLocaleDateString()}.
                        </p>
                    </div>
                ) : (
                    <DocumentAcceptanceForm
                        documentId={doc.id}
                        documentName={doc.name}
                        documentUrl={documentUrl}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        clientName={(Array.isArray(doc.clients) ? doc.clients[0]?.name : (doc.clients as any)?.name) || ''}
                        token={token}
                    />
                )}
            </div>
        </div>
    );
}
