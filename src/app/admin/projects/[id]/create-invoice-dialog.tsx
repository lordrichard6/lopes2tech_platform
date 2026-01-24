'use client';

import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Plus, Minus, Eye, Download, Save, Loader2, Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from "@/lib/utils"
import { PRICING_DATA, Currency, ServiceItem, formatPrice, getPriceForCurrency, getBasePrice, ServiceCategory } from '@/lib/data/pricing';
import { OfferPDFDocument } from '@/lib/pdf/offer-template';
import { pdf } from '@react-pdf/renderer';
import { format, addDays } from 'date-fns';
import { createProjectInvoiceAction } from './actions';
import { useRouter } from 'next/navigation';

import { getSystemSettings } from '../../settings/actions';
import { generateSwissQRBase64, SwissQRBillData } from '@/lib/pdf/generate-qr-bill';

// ... existing imports

interface CreateInvoiceDialogProps {
    project: any;
    iconOnly?: boolean;
}

type Step = 'select' | 'payment' | 'review' | 'preview'; // Added payment step

export function CreateInvoiceDialog({ project, iconOnly }: CreateInvoiceDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>('select');
    // ...
    const [settings, setSettings] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'QR_BILL'>('BANK_TRANSFER');
    const [qrReference, setQrReference] = useState(''); // Manual QRR/SCOR if needed

    // Fetch settings on open
    useEffect(() => {
        if (open) {
            getSystemSettings().then(setSettings);
        }
    }, [open]);

    const [currency, setCurrency] = useState<Currency>('CHF');
    const [selectedItems, setSelectedItems] = useState<Map<string, any>>(new Map()); // Type simplified for now to fix build, ideally InvoiceItem
    const [notes, setNotes] = useState('');
    const [dueDate, setDueDate] = useState<string>(() => {
        // Safe access to client-side only objects if needed, but format/addDays are fine
        return format(addDays(new Date(), 30), 'yyyy-MM-dd');
    });
    const [discount, setDiscount] = useState<number>(0);
    const [language, setLanguage] = useState<'EN' | 'PT' | 'DE'>('EN');
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const invoiceNumber = useMemo(() => {
        const date = new Date();
        return `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }, []);

    const today = format(new Date(), 'dd/MM/yyyy');

    // Pre-fill services from project when opening
    useEffect(() => {
        if (open && project.project_services) {
            const initialItems = new Map<string, any>();
            project.project_services.forEach((ps: any) => {
                const service = ps.services;
                if (service) {
                    const pricingService: ServiceItem = {
                        id: service.id,
                        name: service.name,
                        description: service.description || '',
                        priceCHF: service.price,
                        priceEUR: service.price_eur || service.price,
                        billingType: service.billing_type,
                        category: 'Custom'
                    };

                    initialItems.set(service.id, {
                        service: pricingService,
                        quantity: 1,
                        customPrice: undefined
                    });
                }
            });
            setSelectedItems(initialItems);
        }
    }, [open, project]);

    const updateQuantity = (serviceId: string, delta: number) => {
        const item = selectedItems.get(serviceId);
        if (!item) return;
        const newQty = Math.max(1, item.quantity + delta);
        const newItems = new Map(selectedItems);
        newItems.set(serviceId, { ...item, quantity: newQty });
        setSelectedItems(newItems);
    };

    const updateCustomPrice = (serviceId: string, price: number) => {
        const item = selectedItems.get(serviceId);
        if (!item) return;
        const newItems = new Map(selectedItems);
        newItems.set(serviceId, { ...item, customPrice: price });
        setSelectedItems(newItems);
    };

    const removeItem = (serviceId: string) => {
        const newItems = new Map(selectedItems);
        newItems.delete(serviceId);
        setSelectedItems(newItems);
    }

    const { subtotal, total, discountAmount } = useMemo(() => {
        let sum = 0;
        selectedItems.forEach((item: any) => {
            const price = item.customPrice ?? getBasePrice(getPriceForCurrency(item.service, currency));
            sum += price * item.quantity;
        });
        const discAmount = discount ? sum * (discount / 100) : 0;
        return {
            subtotal: sum,
            discountAmount: discAmount,
            total: sum - discAmount
        };
    }, [selectedItems, currency, discount]);

    const generateInvoiceData = async (): Promise<any> => {
        let qrBillImage = undefined;

        if (paymentMethod === 'QR_BILL' && settings) {
            try {
                // Construct Address from Settings (Creditor)
                // Assuming settings has raw strings, we might need to be careful or split them.
                // For MVP, we pass what we have. swissqrbill validates.
                // Note: Creditor Account must be IBAN.

                // Construct Address from Project/Client (Debtor)
                // We need client address.
                // If project.clients doesn't have address, we use placeholders or fail.
                // Let's try to use available fields or defaults.
                const client = project.clients || {};

                const qrData: SwissQRBillData = {
                    currency: currency,
                    amount: total,
                    reference: qrReference || '', // If empty, assume NON. QRR needs reference.
                    creditor: {
                        name: settings.account_holder || 'Lopes2Tech',
                        address: settings.creditor_street || 'Zurich',
                        zip: settings.creditor_zip || '8000',
                        city: settings.creditor_city || 'Zurich',
                        country: settings.creditor_country || 'CH',
                        account: settings.iban || settings.qr_iban || ''
                    },
                    debtor: {
                        name: client.name || 'Client',
                        address: client.address || 'Unknown St', // Fallback
                        zip: client.zip || '8000',
                        city: client.city || 'Zurich',
                        country: client.country || 'CH'
                    },
                    message: `Invoice ${invoiceNumber}`
                };

                // Create SVG Data URI - now async!
                qrBillImage = await generateSwissQRBase64(qrData);
            } catch (e) {
                console.error("Failed to generate QR Bill", e);
            }
        }

        return {
            offerNumber: invoiceNumber,
            date: today,
            validUntil: format(new Date(dueDate), 'dd/MM/yyyy'),
            clientName: project.clients?.name,
            clientEmail: '',
            clientCompany: '',
            currency,
            items: Array.from(selectedItems.values()),
            notes: notes || undefined,
            paymentTerms: `Due Date: ${format(new Date(dueDate), 'dd/MM/yyyy')}`,
            discount: discount > 0 ? discount : undefined,
            language,
            title: "INVOICE",
            bankDetails: settings ? {
                bankName: settings.bank_name,
                iban: settings.iban,
                bic: settings.bic,
                accountHolder: settings.account_holder,
                qrIban: settings.qr_iban,
                qrReference: qrReference
            } : undefined,
            paymentMethod,
            qrBillImage
        };
    };

    const handlePreview = async () => {
        setIsGenerating(true);
        try {
            const data = await generateInvoiceData();
            const doc = <OfferPDFDocument data={data} />;
            const blob = await pdf(doc).toBlob();
            setPdfBlob(blob);
            setStep('preview');
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // ... rest of component logic including new step UI


    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Create Invoice Record
            const formData = new FormData();
            formData.append('clientId', project.client_id);
            formData.append('projectId', project.id);
            formData.append('amount', total.toString());
            formData.append('description', `Invoice for ${project.name}`);
            formData.append('dueDate', dueDate);

            // Note: We are using the server action which redirects. 
            // We might want to use a custom fetch wrapper or modify the action to return json.
            // Since the action redirects, we might want to avoid calling it directly here if we want to stay.
            // But for MVP, let's call a new dedicated action or use fetch to an API route.
            // Let's assume we create a server action closer to here: createProjectInvoiceAction

            await createProjectInvoiceAction({
                clientId: project.client_id,
                projectId: project.id,
                amount: total,
                currency,
                description: `Invoice ${invoiceNumber} for ${project.name}`,
                dueDate,
                invoiceNumber,
                items: Array.from(selectedItems.values()).map(i => ({
                    service_id: i.service.id,
                    price: i.customPrice || i.service.priceCHF, // simplify
                    quantity: i.quantity
                }))
            });

            // 2. Upload PDF (Optimistic: assume action handles it or separate)
            // If we want to save the PDF, we need to upload it.
            if (pdfBlob) {
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onloadend = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        resolve(base64);
                    };
                });
                reader.readAsDataURL(pdfBlob);
                const base64Data = await base64Promise;

                await fetch('/api/documents/upload-offer', { // Reuse upload endpoint or make generic
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientId: project.client_id,
                        fileName: `Invoice-${invoiceNumber}.pdf`,
                        fileData: base64Data,
                        type: 'invoice'
                    }),
                });
            }

            setOpen(false);
            router.refresh();

        } catch (error) {
            console.error('Error saving invoice', error);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    Create Invoice
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Invoice for {project.name}</DialogTitle>
                    <DialogDescription>Select services and adjust details.</DialogDescription>
                </DialogHeader>

                {step === 'select' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CHF">CHF</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Project Services</Label>
                            {selectedItems.size > 0 ? (
                                <div className="border rounded-lg divide-y">
                                    {Array.from(selectedItems.values()).map((item) => {
                                        const price = getPriceForCurrency(item.service, currency);
                                        const basePrice = getBasePrice(price);
                                        return (
                                            <div key={item.service.id} className="flex items-center justify-between p-3">
                                                <div className="flex-1">
                                                    <div className="font-medium">{item.service.name}</div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {/* Qty */}
                                                    <div className="flex items-center gap-2">
                                                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.service.id, -1)}><Minus className="h-3 w-3" /></Button>
                                                        <span className="w-6 text-center">{item.quantity}</span>
                                                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.service.id, 1)}><Plus className="h-3 w-3" /></Button>
                                                    </div>
                                                    {/* Price */}
                                                    <Input
                                                        type="number"
                                                        className="w-24 text-right"
                                                        value={item.customPrice ?? basePrice}
                                                        onChange={e => updateCustomPrice(item.service.id, Number(e.target.value))}
                                                    />
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.service.id)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No services selected.</p>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-2 pt-4 border-t">
                            <div className="flex items-center gap-4 text-2xl font-bold">
                                <span>Total</span>
                                <span>{formatPrice(total, currency)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label>Discount %</Label>
                                <Input type="number" className="w-20" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
                            </div>
                        </div>

                    </div>
                )}

                {step === 'payment' && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Label className="text-base">Payment Method</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    className={cn(
                                        "cursor-pointer border-2 rounded-lg p-4 hover:border-primary transition-colors",
                                        paymentMethod === 'BANK_TRANSFER' ? "border-primary bg-primary/5" : "border-muted"
                                    )}
                                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                                >
                                    <div className="font-semibold mb-1">Standard Bank Transfer</div>
                                    <div className="text-sm text-muted-foreground">International transfer details (IBAN/BIC)</div>
                                </div>
                                <div
                                    className={cn(
                                        "cursor-pointer border-2 rounded-lg p-4 hover:border-primary transition-colors",
                                        paymentMethod === 'QR_BILL' ? "border-primary bg-primary/5" : "border-muted"
                                    )}
                                    onClick={() => setPaymentMethod('QR_BILL')}
                                >
                                    <div className="font-semibold mb-1">Swiss QR Bill</div>
                                    <div className="text-sm text-muted-foreground">Swiss payment slip with QR code</div>
                                </div>
                            </div>
                        </div>

                        {paymentMethod === 'QR_BILL' && (
                            <div className="space-y-4 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    Swiss QR Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground text-xs">QR-IBAN</Label>
                                        <div className="font-mono text-sm">{settings?.qr_iban || 'Not configured'}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground text-xs">Reference Number (Optional)</Label>
                                        <Input
                                            placeholder="Auto-generated if empty"
                                            value={qrReference}
                                            onChange={e => setQrReference(e.target.value)}
                                            className="h-8 font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Make sure your Payment Details in settings are configured for QR bills.
                                </div>
                            </div>
                        )}

                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-3 text-sm">Review Totals</h4>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>{formatPrice(subtotal, currency)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm py-1">
                                    <span className="text-muted-foreground">Discount:</span>
                                    <span className="text-destructive">- {formatPrice(discountAmount, currency)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t">
                                <span>Total:</span>
                                <span>{formatPrice(total, currency)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'preview' && pdfBlob && (
                    <iframe src={URL.createObjectURL(pdfBlob)} className="w-full h-[500px] border rounded-lg" />
                )}

                <DialogFooter>
                    {step === 'select' && (
                        <Button onClick={() => setStep('payment')} disabled={selectedItems.size === 0}>
                            Continue
                        </Button>
                    )}
                    {step === 'payment' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
                            <Button onClick={handlePreview} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Eye className="mr-2 h-4 w-4" />}
                                Preview PDF
                            </Button>
                        </>
                    )}
                    {step === 'preview' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('payment')}>Back</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                Create Invoice
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
