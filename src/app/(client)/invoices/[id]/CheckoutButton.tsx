'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner" // Assuming sonner or use standard alert

export default function CheckoutButton({ invoiceId }: { invoiceId: string }) {
    const [loading, setLoading] = useState(false)

    const handleCheckout = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceId })
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data)

            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            console.error(error)
            alert('Something went wrong. Please check your configuration.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button size="lg" className="w-full md:w-auto" onClick={handleCheckout} disabled={loading}>
            {loading ? 'Processing...' : 'Pay with Stripe'}
        </Button>
    )
}
