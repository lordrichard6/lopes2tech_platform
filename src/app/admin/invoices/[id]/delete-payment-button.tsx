'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Loader2 } from "lucide-react"
import { deletePaymentAction } from "../actions"
import { toast } from "sonner"

interface DeletePaymentButtonProps {
    paymentId: string
    asChild?: boolean
    children?: React.ReactNode
}

export function DeletePaymentButton({ paymentId, asChild, children }: DeletePaymentButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        setIsDeleting(true)
        const result = await deletePaymentAction(paymentId)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Payment deleted successfully")
            router.refresh()
        }
        setIsDeleting(false)
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild={!!children || asChild}>
                {children ? (
                    children
                ) : (
                    <Button variant="ghost" size="icon" disabled={isDeleting}>
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                    </Button>
                )}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this payment record? This will update the invoice status and amount paid.
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
