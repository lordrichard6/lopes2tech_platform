"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createService, updateService } from "./actions";
import { toast } from "sonner";
import { Plus, Edit } from "lucide-react";

interface ServiceDialogProps {
    mode: "create" | "edit";
    service?: {
        id: string;
        name: string;
        description: string | null;
        price: number;
        billing_type: 'one_time' | 'monthly' | 'yearly';
        active: boolean;
        stripe_product_id?: string | null;
        stripe_price_id?: string | null;
    };
    trigger?: React.ReactNode;
}

export function ServiceDialog({ mode, service, trigger }: ServiceDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLang, setSelectedLang] = useState<'en' | 'pt' | 'de'>('en');

    // Form state
    const [formData, setFormData] = useState({
        name: service?.name || "",
        description: service?.description || "",
        price: service?.price || 0,
        // Multi-language defaults
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name_en: (service as any)?.name_en || service?.name || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name_pt: (service as any)?.name_pt || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name_de: (service as any)?.name_de || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description_en: (service as any)?.description_en || service?.description || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description_pt: (service as any)?.description_pt || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description_de: (service as any)?.description_de || "",
        price_eur: (service as any)?.price_eur || 0,
        billing_type: service?.billing_type || "one_time",
        active: service?.active ?? true,
        stripe_product_id: service?.stripe_product_id || "",
        stripe_price_id: service?.stripe_price_id || "",
    });

    const resetForm = () => {
        setFormData({
            name: service?.name || "",
            description: service?.description || "",
            price: service?.price || 0,
            name_en: (service as any)?.name_en || service?.name || "",
            name_pt: (service as any)?.name_pt || "",
            name_de: (service as any)?.name_de || "",
            description_en: (service as any)?.description_en || service?.description || "",
            description_pt: (service as any)?.description_pt || "",
            description_de: (service as any)?.description_de || "",
            price_eur: (service as any)?.price_eur || 0,
            billing_type: service?.billing_type || "one_time",
            active: service?.active ?? true,
            stripe_product_id: service?.stripe_product_id || "",
            stripe_price_id: service?.stripe_price_id || "",
        });
        setSelectedLang('en');
    };

    const handleNameChange = (val: string) => {
        const updates: any = {};
        // Always update the specific language field
        updates[`name_${selectedLang}`] = val;

        // If editing English, also update the primary 'name' field for backwards compatibility
        if (selectedLang === 'en') {
            updates.name = val;
        }
        setFormData({ ...formData, ...updates });
    };

    const handleDescriptionChange = (val: string) => {
        const updates: any = {};
        updates[`description_${selectedLang}`] = val;
        if (selectedLang === 'en') {
            updates.description = val;
        }
        setFormData({ ...formData, ...updates });
    };

    const getCurrentName = () => {
        return (formData as any)[`name_${selectedLang}`] || "";
    };

    const getCurrentDescription = () => {
        return (formData as any)[`description_${selectedLang}`] || "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (mode === 'create') {
                await createService(formData);
                toast.success('Service created successfully');
            } else {
                await updateService(service!.id, formData);
                toast.success('Service updated successfully');
            }
            setOpen(false);
            if (mode === 'create') resetForm();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    mode === 'create' ? (
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Service
                        </Button>
                    ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                    )
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Create Service' : 'Edit Service'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? 'Add a new service to your catalog.' : 'Make changes to this service.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Language Toggle */}
                        <div className="flex justify-center bg-muted p-1 rounded-lg">
                            <Button
                                type="button"
                                variant={selectedLang === 'en' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setSelectedLang('en')}
                                className="flex-1"
                            >
                                🇺🇸 EN
                            </Button>
                            <Button
                                type="button"
                                variant={selectedLang === 'pt' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setSelectedLang('pt')}
                                className="flex-1"
                            >
                                🇵🇹 PT
                            </Button>
                            <Button
                                type="button"
                                variant={selectedLang === 'de' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setSelectedLang('de')}
                                className="flex-1"
                            >
                                🇩🇪 DE
                            </Button>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Name ({selectedLang.toUpperCase()})</Label>
                            <Input
                                id="name"
                                value={getCurrentName()}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="e.g. Website Starter"
                                required={selectedLang === 'en'}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">
                                Description ({selectedLang.toUpperCase()})
                                <span className="ml-2 text-xs text-muted-foreground font-normal">
                                    Markdown supported ( - Bullet points)
                                </span>
                            </Label>
                            <Textarea
                                id="description"
                                value={getCurrentDescription()}
                                onChange={(e) => handleDescriptionChange(e.target.value)}
                                placeholder="- Feature 1\n- Feature 2"
                                rows={5}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Price (CHF)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price_eur">Price (EUR)</Label>
                                <Input
                                    id="price_eur"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price_eur}
                                    onChange={(e) => setFormData({ ...formData, price_eur: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>



                        {/* Stripe Integration */}
                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div className="col-span-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stripe Integration (Optional)</Label>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="stripe_product_id">Stripe Product ID</Label>
                                <Input
                                    id="stripe_product_id"
                                    value={formData.stripe_product_id}
                                    onChange={(e) => setFormData({ ...formData, stripe_product_id: e.target.value })}
                                    placeholder="prod_..."
                                    className="font-mono text-xs"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
                                <Input
                                    id="stripe_price_id"
                                    value={formData.stripe_price_id}
                                    onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
                                    placeholder="price_..."
                                    className="font-mono text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="billing">Billing Type</Label>
                                <Select
                                    value={formData.billing_type}
                                    onValueChange={(value: any) => setFormData({ ...formData, billing_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="one_time">One Time</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col justify-end">
                                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm h-10">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm">Active</Label>
                                    </div>
                                    <Switch
                                        checked={formData.active}
                                        onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
