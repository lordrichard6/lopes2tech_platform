"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { format, addMonths } from "date-fns";
import { CalendarDays, Plus, Trash2, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PaymentScheduleDialogProps {
    invoice: {
        id: string;
        amount: number;
        currency: string;
        payment_plan_enabled?: boolean;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    existingSchedules?: any[];
}

interface Installment {
    amount: number;
    dueDate: string;
}

export function PaymentScheduleDialog({ invoice, existingSchedules }: PaymentScheduleDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [installments, setInstallments] = useState<Installment[]>(() => {
        if (existingSchedules && existingSchedules.length > 0) {
            return existingSchedules.map(s => ({
                amount: s.amount,
                dueDate: s.due_date
            }));
        }

        // Default to 4 equal installments
        const defaultAmount = Math.floor(invoice.amount / 4);
        const today = new Date();
        return [
            { amount: defaultAmount, dueDate: format(addMonths(today, 1), 'yyyy-MM-dd') },
            { amount: defaultAmount, dueDate: format(addMonths(today, 2), 'yyyy-MM-dd') },
            { amount: defaultAmount, dueDate: format(addMonths(today, 3), 'yyyy-MM-dd') },
            { amount: invoice.amount - (defaultAmount * 3), dueDate: format(addMonths(today, 4), 'yyyy-MM-dd') },
        ];
    });

    // Update state if existingSchedules changes (e.g. after refresh)
    useEffect(() => {
        if (existingSchedules && existingSchedules.length > 0) {
            setInstallments(existingSchedules.map(s => ({
                amount: s.amount,
                dueDate: s.due_date
            })));
        }
    }, [existingSchedules]);
    const router = useRouter();

    const totalScheduled = useMemo(() =>
        installments.reduce((sum, inst) => sum + (inst.amount || 0), 0),
        [installments]
    );

    const isValid = useMemo(() =>
        Math.abs(totalScheduled - invoice.amount) < 0.01 &&
        installments.every(i => i.amount > 0 && i.dueDate),
        [totalScheduled, invoice.amount, installments]
    );

    const difference = totalScheduled - invoice.amount;

    const addInstallment = () => {
        const lastDate = installments.length > 0
            ? new Date(installments[installments.length - 1].dueDate)
            : new Date();
        setInstallments([
            ...installments,
            { amount: 0, dueDate: format(addMonths(lastDate, 1), 'yyyy-MM-dd') }
        ]);
    };

    const removeInstallment = (index: number) => {
        if (installments.length > 1) {
            setInstallments(installments.filter((_, i) => i !== index));
        }
    };

    const updateInstallment = (index: number, field: keyof Installment, value: string | number) => {
        const updated = [...installments];
        updated[index] = { ...updated[index], [field]: value };
        setInstallments(updated);
    };

    const distributeEvenly = () => {
        const count = installments.length;
        const baseAmount = Math.floor(invoice.amount / count);
        const remainder = invoice.amount - (baseAmount * count);

        setInstallments(installments.map((inst, i) => ({
            ...inst,
            amount: baseAmount + (i === count - 1 ? remainder : 0)
        })));
    };

    const handleSave = async () => {
        if (!isValid) return;
        setIsLoading(true);

        try {
            const supabase = createClient();

            // Delete existing schedules if any
            await supabase
                .from('invoice_payment_schedules')
                .delete()
                .eq('invoice_id', invoice.id);

            // Create schedules
            const scheduleData = installments.map((inst, index) => ({
                invoice_id: invoice.id,
                installment_number: index + 1,
                due_date: inst.dueDate,
                amount: inst.amount,
                status: 'pending',
                qr_reference: `INV-${invoice.id.slice(0, 8).toUpperCase()}-INST${index + 1}`,
            }));

            const { error: scheduleError } = await supabase
                .from('invoice_payment_schedules')
                .insert(scheduleData);

            if (scheduleError) throw scheduleError;

            // Update invoice to enable payment plan
            const { error: invoiceError } = await supabase
                .from('invoices')
                .update({
                    payment_plan_enabled: true,
                    installments_count: installments.length
                })
                .eq('id', invoice.id);

            if (invoiceError) throw invoiceError;

            toast.success(`Payment schedule created with ${installments.length} installments`);
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error('Error saving schedule:', error);
            toast.error('Failed to save payment schedule');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {invoice.payment_plan_enabled ? 'Edit Schedule' : 'Create Payment Schedule'}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Payment Schedule</DialogTitle>
                    <DialogDescription>
                        Split invoice of {invoice.currency} {invoice.amount.toLocaleString()} into installments with individual QR bills.
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable content so large schedules stay within viewport */}
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={distributeEvenly}>
                            Split Evenly
                        </Button>
                        <Button variant="outline" size="sm" onClick={addInstallment}>
                            <Plus className="mr-1 h-4 w-4" /> Add Installment
                        </Button>
                    </div>

                    {/* Installments Table */}
                    <div className="border rounded-lg divide-y">
                        {installments.map((inst, index) => (
                            <div key={index} className="flex items-center gap-4 p-3">
                                <div className="w-20 text-sm font-medium text-muted-foreground">
                                    #{index + 1}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs text-muted-foreground">Amount ({invoice.currency})</Label>
                                    <Input
                                        type="number"
                                        value={inst.amount}
                                        onChange={(e) => updateInstallment(index, 'amount', parseFloat(e.target.value) || 0)}
                                        className="h-9"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs text-muted-foreground">Due Date</Label>
                                    <Input
                                        type="date"
                                        value={inst.dueDate}
                                        onChange={(e) => updateInstallment(index, 'dueDate', e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeInstallment(index)}
                                    disabled={installments.length <= 1}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Validation Feedback */}
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${isValid ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                        }`}>
                        {isValid ? (
                            <>
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">Total matches invoice amount</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">
                                    {difference > 0
                                        ? `${invoice.currency} ${difference.toLocaleString()} over invoice total`
                                        : `${invoice.currency} ${Math.abs(difference).toLocaleString()} under invoice total`
                                    }
                                </span>
                            </>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Total Scheduled</span>
                        <span className={`text-lg font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                            {invoice.currency} {totalScheduled.toLocaleString()}
                        </span>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!isValid || isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Schedule
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
