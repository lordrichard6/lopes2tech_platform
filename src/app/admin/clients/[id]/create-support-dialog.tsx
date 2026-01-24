'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Wrench, Eye, Download, Save, Loader2 } from 'lucide-react';
import { SupportAgreementPDFDocument, SupportAgreementData } from '@/lib/pdf/support-agreement-template';
import { pdf } from '@react-pdf/renderer';
import { format, addDays } from 'date-fns';

interface CreateSupportDialogProps {
    clientId: string;
    clientName: string;
    clientEmail?: string;
    clientCompany?: string;
    iconOnly?: boolean;
}

type Step = 'details' | 'preview';
type Language = 'en' | 'pt' | 'de';
type Currency = 'CHF' | 'EUR';

const languageLabels: Record<Language, string> = {
    en: '🇬🇧 English',
    pt: '🇵🇹 Português',
    de: '🇩🇪 Deutsch',
};

export function CreateSupportDialog({ clientId, clientName, clientEmail, clientCompany, iconOnly }: CreateSupportDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>('details');

    // Form state
    const [language, setLanguage] = useState<Language>('en');
    const [currency, setCurrency] = useState<Currency>('CHF');
    const [monthlyFee, setMonthlyFee] = useState(39);
    const [startDate, setStartDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));

    // PDF state
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const today = format(new Date(), 'dd/MM/yyyy');
    const formattedStartDate = startDate ? format(new Date(startDate), 'dd/MM/yyyy') : today;

    const documentNumber = useMemo(() => {
        const date = new Date();
        return `SA-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }, []);

    const generateSupport = async (): Promise<SupportAgreementData> => {
        return {
            language,
            agreementNumber: documentNumber,
            date: today,
            startDate: formattedStartDate,
            clientName,
            clientCompany,
            clientEmail,
            monthlyFee,
            currency,
        };
    };

    const handlePreview = async () => {
        setIsGenerating(true);
        try {
            const supportData = await generateSupport();
            const doc = <SupportAgreementPDFDocument data={supportData} />;
            const blob = await pdf(doc).toBlob();
            setPdfBlob(blob);
            setStep('preview');
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!pdfBlob) return;
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Support-Agreement-${documentNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSaveToDocuments = async () => {
        if (!pdfBlob) return;

        setIsSaving(true);
        try {
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
            });
            reader.readAsDataURL(pdfBlob);
            const base64Data = await base64Promise;

            const response = await fetch('/api/documents/upload-offer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    fileName: `Support-Agreement-${documentNumber}.pdf`,
                    fileData: base64Data,
                    offerNumber: documentNumber,
                    documentType: 'support_agreement',
                }),
            });

            if (!response.ok) throw new Error('Failed to save document');

            setOpen(false);
            resetForm();
            window.location.reload();
        } catch (error) {
            console.error('Error saving document:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setStep('details');
        setLanguage('en');
        setCurrency('CHF');
        setMonthlyFee(39);
        setStartDate(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
        setPdfBlob(null);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            {iconOnly ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" disabled>
                                <Wrench className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Support Agreement</p>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled>
                        <Wrench className="h-4 w-4" />
                        <span className="ml-2">Support Agreement</span>
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'details' && 'Create Support Agreement'}
                        {step === 'preview' && 'Preview PDF'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'details' && 'Set up the monthly hosting and support agreement.'}
                        {step === 'preview' && 'Check the PDF before saving.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Step 1: Details */}
                {step === 'details' && (
                    <div className="space-y-6">
                        {/* Language */}
                        <div className="space-y-2">
                            <Label htmlFor="language">Document Language</Label>
                            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                                <SelectTrigger id="language">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(languageLabels).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        {/* Client Info (Read-only) */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-sm text-muted-foreground">Client Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Client Name</Label>
                                    <Input value={clientName} disabled className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={clientEmail || '-'} disabled className="bg-muted" />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Plan Details */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-sm text-muted-foreground">Plan Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="monthlyFee">Monthly Fee</Label>
                                    <div className="flex gap-2">
                                        <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                                            <SelectTrigger className="w-24">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CHF">CHF</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            id="monthlyFee"
                                            type="number"
                                            value={monthlyFee}
                                            onChange={(e) => setMonthlyFee(Number(e.target.value))}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Plan Summary */}
                        <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Managed Hosting Plan</h4>
                            <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                                Includes: Vercel hosting, SSL, DNS, monitoring, bug fixes, and incident response.
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400">
                                Excludes: New features, design changes, content updates.
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 2: Preview */}
                {step === 'preview' && pdfBlob && (
                    <div className="space-y-4">
                        <iframe
                            src={URL.createObjectURL(pdfBlob)}
                            className="w-full h-[500px] border rounded-lg"
                            title="PDF Preview"
                        />
                    </div>
                )}

                {/* Footer Actions */}
                <DialogFooter className="gap-2">
                    {step === 'details' && (
                        <>
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handlePreview} disabled={isGenerating}>
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Generate PDF
                                    </>
                                )}
                            </Button>
                        </>
                    )}

                    {step === 'preview' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('details')}>Edit</Button>
                            <Button variant="outline" onClick={handleDownload}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                            <Button onClick={handleSaveToDocuments} disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save to Documents
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
