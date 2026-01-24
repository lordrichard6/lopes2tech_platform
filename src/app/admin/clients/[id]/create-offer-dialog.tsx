'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// // import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Plus, Minus, Eye, Download, Save, Loader2, Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { PRICING_DATA, Currency, ServiceItem, formatPrice, getPriceForCurrency, getBasePrice, ServiceCategory } from '@/lib/data/pricing';
import { OfferPDFDocument, OfferData, OfferItem } from '@/lib/pdf/offer-template';
import { pdf } from '@react-pdf/renderer';
import { format, addDays } from 'date-fns';

interface CreateOfferDialogProps {
    clientId: string;
    clientName: string;
    clientEmail?: string;
    clientCompany?: string;
    iconOnly?: boolean;
}

type Step = 'select' | 'review' | 'preview';

export function CreateOfferDialog({ clientId, clientName, clientEmail, clientCompany, iconOnly }: CreateOfferDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>('select');
    const [currency, setCurrency] = useState<Currency>('CHF');
    const [selectedItems, setSelectedItems] = useState<Map<string, OfferItem>>(new Map());
    const [notes, setNotes] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('');
    const [discount, setDiscount] = useState<number>(0);
    const [language, setLanguage] = useState<'EN' | 'PT' | 'DE'>('PT');
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const offerNumber = useMemo(() => {
        const date = new Date();
        return `L2T-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }, []);

    const today = format(new Date(), 'dd/MM/yyyy');
    const validUntil = format(addDays(new Date(), 30), 'dd/MM/yyyy');

    const toggleService = (service: ServiceItem) => {
        const newItems = new Map(selectedItems);
        if (newItems.has(service.id)) {
            newItems.delete(service.id);
        } else {
            newItems.set(service.id, { service, quantity: 1 });
        }
        setSelectedItems(newItems);
    };

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

    const { subtotal, total, discountAmount } = useMemo(() => {
        let sum = 0;
        selectedItems.forEach(item => {
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

    const generateOffer = async (): Promise<OfferData> => {
        return {
            offerNumber,
            date: today,
            validUntil,
            clientName,
            clientEmail,
            clientCompany,
            currency,
            items: Array.from(selectedItems.values()),
            notes: notes || undefined,
            paymentTerms: paymentTerms || undefined,
            discount: discount > 0 ? discount : undefined,
            language,
        };
    };

    const handlePreview = async () => {
        setIsGenerating(true);
        try {
            const offerData = await generateOffer();
            const doc = <OfferPDFDocument data={offerData} />;
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
        a.download = `Proposta-${offerNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSaveToDocuments = async () => {
        if (!pdfBlob) return;

        setIsSaving(true);
        try {
            // Convert blob to base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
            });
            reader.readAsDataURL(pdfBlob);
            const base64Data = await base64Promise;

            // Call server action to save
            const response = await fetch('/api/documents/upload-offer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    fileName: `Proposta-${offerNumber}.pdf`,
                    fileData: base64Data,
                    offerNumber,
                }),
            });

            if (!response.ok) throw new Error('Failed to save document');

            // Close dialog and reset
            setOpen(false);
            resetForm();
            // Optionally trigger a refresh
            window.location.reload();
        } catch (error) {
            console.error('Error saving document:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setStep('select');
        setSelectedItems(new Map());
        setNotes('');
        setPaymentTerms('');
        setDiscount(0);
        setLanguage('PT');
        setPdfBlob(null);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            {iconOnly ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="cursor-pointer">
                                <FileText className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Create Proposal</p>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="cursor-pointer">
                        <FileText className="h-4 w-4" />
                        <span className="ml-2">Create Proposal</span>
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'select' && 'Select Services'}
                        {step === 'review' && 'Review Proposal'}
                        {step === 'preview' && 'Preview PDF'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'select' && 'Choose the services to include in the proposal.'}
                        {step === 'review' && 'Review the details and adjust prices if necessary.'}
                        {step === 'preview' && 'Check the PDF before saving.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Step 1: Select Services */}
                {step === 'select' && (
                    <div className="space-y-6">
                        {/* Currency & Language Selector */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4">
                                <Label htmlFor="currency">Currency:</Label>
                                <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CHF">🇨🇭 CHF</SelectItem>
                                        <SelectItem value="EUR">🇵🇹 EUR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-4">
                                <Label htmlFor="language">Language:</Label>
                                <Select value={language} onValueChange={(v) => setLanguage(v as 'EN' | 'PT' | 'DE')}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EN">English</SelectItem>
                                        <SelectItem value="PT">Português</SelectItem>
                                        <SelectItem value="DE">Deutsch</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Service Selection Combobox */}
                        <div className="space-y-4">
                            <Label>Add Services</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                    >
                                        Select services...
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[500px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search service..." />
                                        <CommandList>
                                            <CommandEmpty>No service found.</CommandEmpty>
                                            {PRICING_DATA.map((category: ServiceCategory) => (
                                                <CommandGroup key={category.id} heading={category.nameEN || category.name}>
                                                    {category.services.map((service: ServiceItem) => {
                                                        const isSelected = selectedItems.has(service.id);
                                                        const price = getPriceForCurrency(service, currency);
                                                        return (
                                                            <CommandItem
                                                                key={service.id}
                                                                value={`${service.name} ${service.description}`}
                                                                onSelect={() => toggleService(service)}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        isSelected ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col flex-1">
                                                                    <span>{service.name}</span>
                                                                    <span className="text-xs text-muted-foreground">{service.description}</span>
                                                                </div>
                                                                <Badge variant="secondary" className="ml-2">
                                                                    {formatPrice(price, currency)}
                                                                </Badge>
                                                            </CommandItem>
                                                        );
                                                    })}
                                                </CommandGroup>
                                            ))}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            {/* Selected Items List (Preview) */}
                            {selectedItems.size > 0 && (
                                <div className="space-y-2 mt-4">
                                    <Label>Selected Items ({selectedItems.size})</Label>
                                    <div className="border rounded-lg divide-y">
                                        {Array.from(selectedItems.values()).map((item) => {
                                            const price = getPriceForCurrency(item.service, currency);
                                            return (
                                                <div key={item.service.id} className="flex items-center justify-between p-3 bg-muted/20">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium text-sm">{item.service.name}</div>
                                                        <Badge variant="outline" className="text-xs font-normal">
                                                            {formatPrice(price, currency)}
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                        onClick={() => toggleService(item.service)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Review */}
                {step === 'review' && (
                    <div className="space-y-6">
                        {/* Selected Items */}
                        <div className="space-y-3">
                            <Label>Selected Services</Label>
                            {Array.from(selectedItems.values()).map((item) => {
                                const basePrice = getBasePrice(getPriceForCurrency(item.service, currency));

                                return (
                                    <div key={item.service.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{item.service.name}</div>
                                            <div className="text-xs text-muted-foreground">{item.service.description}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {/* Quantity */}
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-7 w-7"
                                                    onClick={() => updateQuantity(item.service.id, -1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-6 text-center text-sm">{item.quantity}</span>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-7 w-7"
                                                    onClick={() => updateQuantity(item.service.id, 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            {/* Price */}
                                            <div className="w-28">
                                                <Input
                                                    type="number"
                                                    value={item.customPrice ?? basePrice}
                                                    onChange={(e) => updateCustomPrice(item.service.id, Number(e.target.value))}
                                                    className="text-right"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Separator />

                        {/* Totals & Discount */}
                        <div className="flex flex-col items-end gap-2 pt-4 border-t">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal, currency)}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Label htmlFor="discount" className="text-sm font-normal text-muted-foreground">Discount %</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="w-20 h-8 text-right"
                                    value={discount === 0 ? '' : discount}
                                    onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                                    placeholder="0"
                                />
                                <span className="text-sm text-destructive w-24 text-right">
                                    - {formatPrice(discountAmount, currency)}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-2xl font-bold text-primary mt-2">
                                <span>Total</span>
                                <span>{formatPrice(total, currency)}</span>
                            </div>
                        </div>

                        <Separator />

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add special notes for the client..."
                                rows={3}
                            />
                        </div>

                        {/* Payment Terms */}
                        <div className="space-y-2">
                            <Label htmlFor="paymentTerms">Payment Terms (optional)</Label>
                            <Textarea
                                id="paymentTerms"
                                value={paymentTerms}
                                onChange={(e) => setPaymentTerms(e.target.value)}
                                placeholder="• 50% deposit to start&#10;• 50% on launch"
                                rows={3}
                            />
                        </div>
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
                    {step === 'select' && (
                        <>
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button
                                disabled={selectedItems.size === 0}
                                onClick={() => setStep('review')}
                            >
                                Continue ({selectedItems.size} services)
                            </Button>
                        </>
                    )}

                    {step === 'review' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
                            <Button onClick={handlePreview} disabled={isGenerating}>
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Preview PDF
                                    </>
                                )}
                            </Button>
                        </>
                    )}

                    {step === 'preview' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('review')}>Edit</Button>
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
