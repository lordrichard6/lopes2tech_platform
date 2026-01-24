'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { PackageCheck, Eye, Download, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { HandoverPDFDocument, HandoverData, Deliverable, Credential } from '@/lib/pdf/handover-template';
import { pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';

interface CreateHandoverDialogProps {
    clientId: string;
    clientName: string;
    clientEmail?: string;
    clientCompany?: string;
    iconOnly?: boolean;
}

type Step = 'details' | 'credentials' | 'preview';
type Language = 'en' | 'pt' | 'de';

const languageLabels: Record<Language, string> = {
    en: '🇬🇧 English',
    pt: '🇵🇹 Português',
    de: '🇩🇪 Deutsch',
};

const defaultDeliverables: Deliverable[] = [
    { name: 'Responsive Website', complete: true },
    { name: 'Mobile Optimization', complete: true },
    { name: 'SEO Setup', complete: true },
    { name: 'Google Analytics', complete: true },
    { name: 'Contact Form', complete: true },
    { name: 'Content Integration', complete: true },
];

export function CreateHandoverDialog({ clientId, clientName, clientEmail, clientCompany, iconOnly }: CreateHandoverDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>('details');

    // Form state
    const [language, setLanguage] = useState<Language>('en');
    const [projectName, setProjectName] = useState('');
    const [projectDuration, setProjectDuration] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [deliverables, setDeliverables] = useState<Deliverable[]>(defaultDeliverables);
    const [newDeliverable, setNewDeliverable] = useState('');
    const [credentials, setCredentials] = useState<Credential[]>([
        { service: 'Website', url: '', email: clientEmail || '', password: '' },
    ]);
    const [limitations, setLimitations] = useState('');

    // PDF state
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const today = format(new Date(), 'dd/MM/yyyy');

    const documentNumber = useMemo(() => {
        const date = new Date();
        return `HO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }, []);

    const toggleDeliverable = (index: number) => {
        const updated = [...deliverables];
        updated[index].complete = !updated[index].complete;
        setDeliverables(updated);
    };

    const addDeliverable = () => {
        if (newDeliverable.trim()) {
            setDeliverables([...deliverables, { name: newDeliverable.trim(), complete: true }]);
            setNewDeliverable('');
        }
    };

    const removeDeliverable = (index: number) => {
        setDeliverables(deliverables.filter((_, i) => i !== index));
    };

    const addCredential = () => {
        setCredentials([...credentials, { service: '', url: '', email: '', password: '' }]);
    };

    const updateCredential = (index: number, field: keyof Credential, value: string) => {
        const updated = [...credentials];
        updated[index] = { ...updated[index], [field]: value };
        setCredentials(updated);
    };

    const removeCredential = (index: number) => {
        setCredentials(credentials.filter((_, i) => i !== index));
    };

    const generateHandover = async (): Promise<HandoverData> => {
        const limitationsList = limitations.split('\n').filter(l => l.trim());

        return {
            language,
            documentNumber,
            date: today,
            clientName,
            clientCompany,
            projectName,
            projectDuration: projectDuration || undefined,
            deliverables: deliverables.filter(d => d.name.trim()),
            credentials: credentials.filter(c => c.service.trim()),
            limitations: limitationsList.length > 0 ? limitationsList : undefined,
            websiteUrl,
        };
    };

    const handlePreview = async () => {
        setIsGenerating(true);
        try {
            const handoverData = await generateHandover();
            const doc = <HandoverPDFDocument data={handoverData} />;
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
        a.download = `Handover-${documentNumber}.pdf`;
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
                    fileName: `Handover-${documentNumber}.pdf`,
                    fileData: base64Data,
                    offerNumber: documentNumber,
                    documentType: 'handover',
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
        setProjectDuration('');
        setWebsiteUrl('');
        setDeliverables(defaultDeliverables);
        setCredentials([{ service: 'Website', url: '', email: clientEmail || '', password: '' }]);
        setLimitations('');
        setPdfBlob(null);
    };

    const isStep1Valid = projectName.trim() !== '' && websiteUrl.trim() !== '';
    const isStep2Valid = credentials.some(c => c.service.trim() !== '');

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            {iconOnly ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" disabled>
                                <PackageCheck className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Handover Document</p>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled>
                        <PackageCheck className="h-4 w-4" />
                        <span className="ml-2">Handover</span>
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'details' && 'Create Handover Document'}
                        {step === 'credentials' && 'Access Credentials'}
                        {step === 'preview' && 'Preview PDF'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'details' && 'Project details and deliverables checklist.'}
                        {step === 'credentials' && 'Add access credentials for the client.'}
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

                        {/* Project Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="projectName">Project Name *</Label>
                                <Input
                                    id="projectName"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="e.g. Company Website"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="websiteUrl">Website URL *</Label>
                                <Input
                                    id="websiteUrl"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    placeholder="e.g. https://company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">Project Duration</Label>
                            <Input
                                id="duration"
                                value={projectDuration}
                                onChange={(e) => setProjectDuration(e.target.value)}
                                placeholder="e.g. 2 weeks"
                            />
                        </div>

                        <Separator />

                        {/* Deliverables */}
                        <div className="space-y-3">
                            <Label>Deliverables Checklist</Label>
                            <div className="space-y-2">
                                {deliverables.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                                        <Checkbox
                                            checked={item.complete}
                                            onCheckedChange={() => toggleDeliverable(index)}
                                        />
                                        <span className="flex-1 text-sm">{item.name}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => removeDeliverable(index)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newDeliverable}
                                    onChange={(e) => setNewDeliverable(e.target.value)}
                                    placeholder="Add deliverable..."
                                    onKeyDown={(e) => e.key === 'Enter' && addDeliverable()}
                                />
                                <Button variant="outline" onClick={addDeliverable}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        {/* Limitations */}
                        <div className="space-y-2">
                            <Label htmlFor="limitations">Known Limitations (one per line)</Label>
                            <Textarea
                                id="limitations"
                                value={limitations}
                                onChange={(e) => setLimitations(e.target.value)}
                                placeholder="Optional: List any known limitations or notes..."
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Credentials */}
                {step === 'credentials' && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            {credentials.map((cred, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Credential #{index + 1}</Label>
                                        {credentials.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => removeCredential(index)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Service Name</Label>
                                            <Input
                                                value={cred.service}
                                                onChange={(e) => updateCredential(index, 'service', e.target.value)}
                                                placeholder="e.g. Website Admin"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">URL</Label>
                                            <Input
                                                value={cred.url || ''}
                                                onChange={(e) => updateCredential(index, 'url', e.target.value)}
                                                placeholder="e.g. https://company.com/admin"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Email</Label>
                                            <Input
                                                value={cred.email || ''}
                                                onChange={(e) => updateCredential(index, 'email', e.target.value)}
                                                placeholder="admin@company.com"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Password</Label>
                                            <Input
                                                value={cred.password || ''}
                                                onChange={(e) => updateCredential(index, 'password', e.target.value)}
                                                placeholder="Initial password"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full" onClick={addCredential}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another Credential
                        </Button>
                    </div>
                )}

                {/* Step 3: Preview */}
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
                            <Button onClick={() => setStep('credentials')} disabled={!isStep1Valid}>
                                Continue
                            </Button>
                        </>
                    )}

                    {step === 'credentials' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('details')}>Back</Button>
                            <Button onClick={handlePreview} disabled={isGenerating || !isStep2Valid}>
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
                            <Button variant="outline" onClick={() => setStep('credentials')}>Edit</Button>
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
