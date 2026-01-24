'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Gift, Eye, Download, Save, Loader2 } from 'lucide-react';
import { WelcomePDFDocument, WelcomeData } from '@/lib/pdf/welcome-template';
import { pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';

interface CreateWelcomeDialogProps {
    clientId: string;
    clientName: string;
    clientEmail?: string;
    clientCompany?: string;
    iconOnly?: boolean;
}

type Step = 'details' | 'preview';
type Language = 'en' | 'pt' | 'de';

const languageLabels: Record<Language, string> = {
    en: '🇬🇧 English',
    pt: '🇵🇹 Português',
    de: '🇩🇪 Deutsch',
};

export function CreateWelcomeDialog({ clientId, clientName, clientEmail, clientCompany, iconOnly }: CreateWelcomeDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>('details');

    // Form state
    const [language, setLanguage] = useState<Language>('en');

    const [projectName, setProjectName] = useState('');
    const [estimatedTimeline, setEstimatedTimeline] = useState('');
    // PDF state
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const today = format(new Date(), 'dd/MM/yyyy');
    const portalUrl = 'https://app.lopes2tech.ch';

    const documentNumber = useMemo(() => {
        const date = new Date();
        return `OG-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }, []);

    // Generate a random password if not set


    const generateWelcome = async (): Promise<WelcomeData> => {
        return {
            language,
            date: today,
            clientName,
            clientCompany,
            clientEmail: clientEmail || '',
            portalUrl,
            portalUrl,
            projectName,
            estimatedTimeline: estimatedTimeline || undefined,
        };
    };

    const handlePreview = async () => {
        setIsGenerating(true);
        try {
            const welcomeData = await generateWelcome();
            const doc = <WelcomePDFDocument data={welcomeData} />;
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
        a.download = `Onboarding-${documentNumber}.pdf`;
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
                    fileName: `Onboarding-${documentNumber}.pdf`,
                    fileData: base64Data,
                    offerNumber: documentNumber,
                    documentType: 'onboarding_guide',
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
        setProjectName('');
        setEstimatedTimeline('');
        setProjectName('');
        setEstimatedTimeline('');
        setPdfBlob(null);
    };

    const isFormValid = projectName.trim() !== '';

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            {iconOnly ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" disabled>
                                <Gift className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Onboarding Guide</p>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled>
                        <Gift className="h-4 w-4" />
                        <span className="ml-2">Onboarding Guide</span>
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'details' && 'Create Onboarding Guide'}
                        {step === 'preview' && 'Preview PDF'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'details' && 'Generate an onboarding guide for your new client.'}
                        {step === 'preview' && 'Check the PDF before saving.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Step 1: Details */}
                {step === 'details' && (
                    <div className="space-y-6">
                        {/* Language Selector */}
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

                        {/* Project Details */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-sm text-muted-foreground">Project Details</h3>
                            <div className="space-y-2">
                                <Label htmlFor="projectName">Project Name *</Label>
                                <Input
                                    id="projectName"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="e.g. Company Website Redesign"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timeline">Estimated Timeline</Label>
                                <Input
                                    id="timeline"
                                    value={estimatedTimeline}
                                    onChange={(e) => setEstimatedTimeline(e.target.value)}
                                    placeholder="e.g. 2-3 weeks"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Portal Access */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-sm text-muted-foreground">Portal Access Credentials</h3>
                            <div className="space-y-2">
                                <Label>Portal URL</Label>
                                <Input value={portalUrl} disabled className="bg-muted" />
                            </div>
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
                            <Button onClick={handlePreview} disabled={isGenerating || !isFormValid}>
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
