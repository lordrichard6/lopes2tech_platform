'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { ScrollText, Eye, Download, Save, Loader2, Plus, Minus, Check, ChevronsUpDown, X } from 'lucide-react';
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
import { ContractPDFDocument, ContractData } from '@/lib/pdf/contract-template';
import { pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';

interface CreateContractDialogProps {
    clientId: string;
    clientName: string;
    clientEmail?: string;
    clientCompany?: string;
    clientCity?: string;
    iconOnly?: boolean;
}

type Step = 'select' | 'details' | 'preview';
type Language = 'en' | 'pt' | 'de';

interface SelectedServiceItem {
    service: ServiceItem;
    quantity: number;
    customPrice?: number;
}

const languageLabels: Record<Language, string> = {
    en: '🇬🇧 English',
    pt: '🇵🇹 Português',
    de: '🇩🇪 Deutsch',
};

export function CreateContractDialog({ clientId, clientName, clientEmail, clientCompany, clientCity, iconOnly }: CreateContractDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>('select');

    // Form state
    const [language, setLanguage] = useState<Language>('en');
    const [currency, setCurrency] = useState<Currency>('CHF');
    const [selectedItems, setSelectedItems] = useState<Map<string, SelectedServiceItem>>(new Map());
    const [revisionRounds, setRevisionRounds] = useState(2);
    const [city, setCity] = useState(clientCity || '');

    const [customScope, setCustomScope] = useState('');
    const [discount, setDiscount] = useState<number>(0);

    // PDF state
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const contractNumber = useMemo(() => {
        const date = new Date();
        return `CTR-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }, []);

    const today = format(new Date(), 'dd/MM/yyyy');

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

    const generateContract = async (): Promise<ContractData> => {
        // Build scope description from selected services
        const scopeDescription = Array.from(selectedItems.values())
            .map(item => `${item.service.name}${item.quantity > 1 ? ` (x${item.quantity})` : ''}`)
            .join(', ');

        return {
            contractNumber,
            date: today,
            language,
            clientName,
            clientCompany,
            clientCity: city,
            clientEmail,
            selectedPackage: 'custom',
            customPrice: subtotal,
            customScope: customScope || scopeDescription,
            revisionRounds,
            projectTotal: total,
            discount: discount > 0 ? discount : undefined,
            currency,
        };
    };

    const handlePreview = async () => {
        setIsGenerating(true);
        try {
            const contractData = await generateContract();
            const doc = <ContractPDFDocument data={contractData} />;
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
        a.download = `Contract-${contractNumber}.pdf`;
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
                    fileName: `Contract-${contractNumber}.pdf`,
                    fileData: base64Data,
                    offerNumber: contractNumber,
                    documentType: 'contract',
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
        setStep('select');
        setLanguage('en');
        setCurrency('CHF');
        setSelectedItems(new Map());
        setRevisionRounds(2);
        setCity(clientCity || '');
        setCustomScope('');
        setDiscount(0);
        setPdfBlob(null);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            {iconOnly ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="cursor-pointer">
                                <ScrollText className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Create Contract</p>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="cursor-pointer">
                        <ScrollText className="h-4 w-4" />
                        <span className="ml-2">Create Contract</span>
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'select' && 'Select Services for Contract'}
                        {step === 'details' && 'Review Contract Details'}
                        {step === 'preview' && 'Preview PDF'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'select' && 'Choose the services to include in the contract.'}
                        {step === 'details' && 'Review the terms and adjust if necessary.'}
                        {step === 'preview' && 'Check the PDF before saving.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Step 1: Select Services */}
                {step === 'select' && (
                    <div className="space-y-6">
                        {/* Language & Currency Row */}
                        <div className="grid grid-cols-2 gap-4">
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
                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                                    <SelectTrigger id="currency">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CHF">🇨🇭 CHF</SelectItem>
                                        <SelectItem value="EUR">🇵🇹 EUR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator />

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

                {/* Step 2: Details */}
                {step === 'details' && (
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

                        {/* Total */}
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

                        {/* Client City */}
                        <div className="space-y-2">
                            <Label htmlFor="city">Client City</Label>
                            <Input
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="e.g. Lisbon, Porto, Zurich..."
                            />
                        </div>

                        {/* Revision Rounds */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="revisions">Revision Rounds Included</Label>
                                <Select value={revisionRounds.toString()} onValueChange={(v) => setRevisionRounds(Number(v))}>
                                    <SelectTrigger id="revisions">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <SelectItem key={n} value={n.toString()}>{n} rounds</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Custom Scope */}
                        <div className="space-y-2">
                            <Label htmlFor="customScope">Scope Description (optional)</Label>
                            <Textarea
                                id="customScope"
                                value={customScope}
                                onChange={(e) => setCustomScope(e.target.value)}
                                placeholder="Additional scope details or custom description..."
                                rows={2}
                            />
                        </div>

                        {/* Summary Box */}
                        <div className="p-4 bg-muted/50 rounded-lg border">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-sm text-muted-foreground">Project Total</div>
                                    <div className="text-2xl font-bold text-primary">
                                        {formatPrice(total, currency)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">Deposit (50%)</div>
                                    <div className="text-lg font-semibold">
                                        {formatPrice(total / 2, currency)}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                                + CHF 39/month managed hosting after launch
                            </div>
                        </div>

                        {/* Contract Terms Summary */}
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm">
                            <p className="font-medium text-amber-800 dark:text-amber-200">Contract includes:</p>
                            <ul className="mt-2 space-y-1 text-amber-700 dark:text-amber-300 text-xs">
                                <li>• Liability limitation (capped at fees paid)</li>
                                <li>• Anti-ghosting protocol (10-day hold, CHF 150 restart)</li>
                                <li>• Managed hosting CHF 39/month (suspension after 30 days, deletion after 6 months)</li>
                                <li>• Jurisdiction: Canton of Zurich, Switzerland</li>
                            </ul>
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
                                onClick={() => setStep('details')}
                            >
                                Continue ({selectedItems.size} services)
                            </Button>
                        </>
                    )}

                    {step === 'details' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
                            <Button onClick={handlePreview} disabled={isGenerating || !city}>
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
