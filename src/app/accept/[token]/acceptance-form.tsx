'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, FileText, CheckCircle, Download } from 'lucide-react';

interface DocumentAcceptanceFormProps {
    documentId: string;
    documentName: string;
    documentUrl: string | null;
    clientName: string;
    token: string;
}

export function DocumentAcceptanceForm({
    documentId,
    documentName,
    documentUrl,
    clientName,
    token,
}: DocumentAcceptanceFormProps) {
    const [signatureName, setSignatureName] = useState(clientName);
    const [isAccepted, setIsAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!signatureName.trim()) {
            setError('Please enter your name');
            return;
        }

        if (!isAccepted) {
            setError('Please accept the terms to continue');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/documents/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    signatureName: signatureName.trim(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to sign document');
            }

            setIsSuccess(true);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-green-800 mb-2">Thank You!</h2>
                <p className="text-green-700 mb-4">
                    The document has been successfully signed. A confirmation has been sent to your email.
                </p>
                <p className="text-sm text-green-600">
                    Signed by: <strong>{signatureName}</strong> on {new Date().toLocaleDateString()}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Document Info */}
            <div className="bg-blue-50 border-b border-blue-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{documentName}</h2>
                        <p className="text-sm text-gray-600">Please review and sign below</p>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            {documentUrl && (
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Document Preview</span>
                        <a
                            href={documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <Download className="w-4 h-4" />
                            Download PDF
                        </a>
                    </div>
                    <iframe
                        src={documentUrl}
                        className="w-full h-[400px] border rounded-lg bg-white"
                        title="Document Preview"
                    />
                </div>
            )}

            {/* Signature Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Name Input */}
                <div className="space-y-2">
                    <Label htmlFor="signatureName">Your Full Name *</Label>
                    <Input
                        id="signatureName"
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        placeholder="Enter your full name"
                        className="text-lg"
                    />
                    <p className="text-xs text-gray-500">
                        This will be your digital signature
                    </p>
                </div>

                {/* Acceptance Checkbox */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="accept"
                            checked={isAccepted}
                            onCheckedChange={(checked) => setIsAccepted(checked === true)}
                            className="mt-1"
                        />
                        <Label htmlFor="accept" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                            I have read and understood the document above. By checking this box and clicking
                            &quot;Sign Document&quot;, I acknowledge that this constitutes my electronic signature
                            and that I agree to all terms and conditions stated in the document.
                        </Label>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting || !signatureName.trim() || !isAccepted}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Sign Document
                        </>
                    )}
                </Button>

                {/* Legal Note */}
                <p className="text-xs text-center text-gray-500">
                    Your signature is legally binding under Swiss law.
                    A confirmation email will be sent after signing.
                </p>
            </form>
        </div>
    );
}
