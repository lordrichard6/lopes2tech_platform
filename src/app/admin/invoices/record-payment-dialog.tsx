'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Plus, Calendar } from "lucide-react"
import { recordPaymentAction } from "./actions"
import { createClient } from "@/lib/supabase/client"

interface RecordPaymentDialogProps {
    invoiceId: string
    invoiceAmount: number
    amountPaid: number
    currency: string
}

const formSchema = z.object({
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    payment_date: z.string().min(1, "Payment date is required"),
    payment_method: z.string().optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
    installment_number: z.number().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function RecordPaymentDialog({ invoiceId, invoiceAmount, amountPaid, currency }: RecordPaymentDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [schedules, setSchedules] = useState<any[]>([])
    const router = useRouter()

    const remainingAmount = invoiceAmount - amountPaid

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: remainingAmount > 0 ? remainingAmount : 0,
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: "",
            reference: "",
            notes: "",
        },
    })

    // Fetch schedules when dialog opens
    useEffect(() => {
        if (open) {
            const fetchSchedules = async () => {
                const supabase = createClient()
                const { data } = await supabase
                    .from('invoice_payment_schedules')
                    .select('*')
                    .eq('invoice_id', invoiceId)
                    .order('installment_number')

                if (data) setSchedules(data)
            }
            fetchSchedules()
        }
    }, [open, invoiceId])

    // Auto-fill amount when installment selected
    const handleInstallmentChange = (value: string) => {
        const installmentNum = parseInt(value)
        form.setValue('installment_number', installmentNum)

        const schedule = schedules.find(s => s.installment_number === installmentNum)
        if (schedule) {
            form.setValue('amount', schedule.amount)
            form.setValue('reference', schedule.qr_reference || '')
        }
    }

    async function onSubmit(values: FormValues) {
        setIsLoading(true)

        const formData = new FormData()
        formData.append('invoice_id', invoiceId)
        formData.append('amount', values.amount.toString())
        formData.append('payment_date', values.payment_date)
        if (values.payment_method) formData.append('payment_method', values.payment_method)
        if (values.reference) formData.append('reference', values.reference)
        if (values.notes) formData.append('notes', values.notes)
        if (values.installment_number) formData.append('installment_number', values.installment_number.toString())

        const result = await recordPaymentAction(formData)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Payment recorded successfully")
            setOpen(false)
            form.reset()
            router.refresh()
        }
        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Record Payment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                        Record a payment received for this invoice.
                    </DialogDescription>
                </DialogHeader>

                <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-medium">{currency} {invoiceAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Amount Paid:</span>
                        <span className="font-medium">{currency} {amountPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="font-medium">Remaining:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                            {currency} {remainingAmount.toLocaleString()}
                        </span>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* Installment Selection (if schedules exist) */}
                        {schedules.length > 0 && (
                            <div className="space-y-2">
                                <FormLabel>Link to Installment (Optional)</FormLabel>
                                <Select onValueChange={handleInstallmentChange}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select installment" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {schedules.map((s) => (
                                            <SelectItem
                                                key={s.id}
                                                value={s.installment_number.toString()}
                                                disabled={s.status === 'paid'}
                                            >
                                                #{s.installment_number} - {currency} {s.amount}
                                                {s.status === 'paid' ? ' (Paid)' : ` (Due ${s.due_date})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount ({currency})</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="payment_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="payment_method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Method</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment method" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="twint">TWINT</SelectItem>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="paypal">PayPal</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reference"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reference / Transaction ID</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g., TXN-12345 or QR Ref" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Additional notes about this payment..."
                                            className="min-h-[80px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Record Payment
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
