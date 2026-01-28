'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updatePaymentAction } from "../actions"

interface EditPaymentDialogProps {
    invoiceId: string
    payment: {
        id: string
        amount: number
        payment_date: string
        payment_method?: string | null
        reference?: string | null
        notes?: string | null
    }
    trigger?: React.ReactNode
}

export function EditPaymentDialog({ invoiceId, payment, trigger }: EditPaymentDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    const [amount, setAmount] = useState<number>(payment.amount)
    const [paymentDate, setPaymentDate] = useState<string>(payment.payment_date?.slice(0, 10) || '')
    const [method, setMethod] = useState<string>(payment.payment_method || '')
    const [reference, setReference] = useState<string>(payment.reference || '')
    const [notes, setNotes] = useState<string>(payment.notes || '')

    async function onSave() {
        setIsSaving(true)
        try {
            const formData = new FormData()
            formData.append('payment_id', payment.id)
            formData.append('invoice_id', invoiceId)
            formData.append('amount', String(amount))
            formData.append('payment_date', paymentDate)
            formData.append('payment_method', method)
            formData.append('reference', reference)
            formData.append('notes', notes)

            const result = await updatePaymentAction(formData)
            if (result?.error) {
                toast.error(result.error)
                return
            }

            toast.success("Payment updated")
            setOpen(false)
            router.refresh()
        } catch (e: any) {
            console.error(e)
            toast.error(e?.message || "Failed to update payment")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit payment</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label>Amount (read-only)</Label>
                        <Input
                            type="number"
                            value={amount}
                            disabled
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Method</Label>
                        <Input
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            placeholder="stripe / bank_transfer / cash / twint"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Reference</Label>
                        <Input
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Notes</Label>
                        <Input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={onSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

