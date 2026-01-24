'use client'

import { useState } from "react"
import { createSubscription, cancelSubscription, deleteSubscription } from "./subscription-actions"
import { useRouter } from "next/navigation"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, CreditCard, Calendar, Trash2, Link as LinkIcon, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { createSubscriptionCheckoutSession } from "./stripe-actions"
import { toast } from "sonner"



interface SubscriptionsCardProps {
    clientId: string;
    clientName?: string;
    clientEmail?: string;
    subscriptions: any[];
    availableServices: any[];
}

export function SubscriptionsCard({ clientId, clientName, clientEmail, subscriptions, availableServices }: SubscriptionsCardProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isCancelling, setIsCancelling] = useState<string | null>(null)
    const [isGeneratingLink, setIsGeneratingLink] = useState<string | null>(null)
    const router = useRouter()

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)
        const serviceId = formData.get('service_id') as string
        const service = availableServices.find(s => s.id === serviceId)

        if (!service) return

        try {
            await createSubscription({
                client_id: clientId,
                service_id: serviceId,
                amount: service.price,
                start_date: formData.get('start_date') as string
            })
            setOpen(false)
            router.refresh()
            toast.success("Subscription added using local database")
        } catch (error) {
            console.error(error)
            toast.error('Failed to add subscription')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGenerateLink = async (sub: any) => {
        if (!sub.services?.stripe_price_id) {
            toast.error("This service is not linked to Stripe")
            return
        }

        setIsGeneratingLink(sub.id)
        try {
            const result = await createSubscriptionCheckoutSession(
                sub.id,
                sub.services.stripe_price_id,
                clientEmail,
                clientName
            )

            if (result.url) {
                await navigator.clipboard.writeText(result.url)
                toast.success("Payment Link copied to clipboard!")
                window.open(result.url, '_blank')
            }
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to generate link')
        } finally {
            setIsGeneratingLink(null)
        }
    }

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this subscription?')) return
        setIsCancelling(id)
        try {
            await cancelSubscription(id, clientId)
            router.refresh()
            toast.success("Subscription cancelled")
        } catch (error) {
            console.error(error)
            toast.error('Failed to cancel')
        } finally {
            setIsCancelling(null)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this subscription?')) return
        try {
            await deleteSubscription(id, clientId)
            router.refresh()
            toast.success("Subscription deleted")
        } catch (error) {
            console.error(error)
            toast.error('Failed to delete')
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Active Subscriptions</CardTitle>
                    <CardDescription>Recurring services and retainers.</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Subscription
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Subscription</DialogTitle>
                            <DialogDescription>Assign a recurring service to this client.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="service">Service</Label>
                                <Select name="service_id" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableServices.filter(s => s.billing_type !== 'one_time').map((service) => (
                                            <SelectItem key={service.id} value={service.id}>
                                                {service.name} (CHF {service.price}/{service.billing_type === 'monthly' ? 'mo' : 'yr'})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input type="date" name="start_date" defaultValue={new Date().toISOString().split('T')[0]} required />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Add Subscription
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {subscriptions && subscriptions.length > 0 ? (
                    <div className="space-y-4">
                        {subscriptions.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div>
                                    <h4 className="font-semibold flex items-center gap-2">
                                        {sub.services?.name || 'Unknown Service'}
                                        {sub.stripe_subscription_id && (
                                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                Stripe Linked
                                            </Badge>
                                        )}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                            <CreditCard className="h-3 w-3" />
                                            CHF {sub.amount}
                                            <span className="text-xs ml-1">/{sub.services?.billing_type === 'monthly' ? 'mo' : 'yr'}</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {sub.status === 'cancelled' ? (
                                                <span>Ended {sub.updated_at ? format(new Date(sub.updated_at), 'PP') : 'Unknown'}</span>
                                            ) : (
                                                <span>Started {sub.start_date ? format(new Date(sub.start_date), 'PP') : 'Unknown'}</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                                        {sub.status}
                                    </Badge>

                                    {/* Link Stripe Button */}
                                    {sub.status === 'active' && !sub.stripe_subscription_id && sub.services?.stripe_price_id && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                                            onClick={() => handleGenerateLink(sub)}
                                            disabled={!!isGeneratingLink}
                                        >
                                            {isGeneratingLink === sub.id ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <LinkIcon className="h-3 w-3" />
                                            )}
                                            Link Payment
                                        </Button>
                                    )}

                                    {sub.status === 'active' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-amber-600 hover:text-amber-700 h-8"
                                            onClick={() => handleCancel(sub.id)}
                                            disabled={!!isCancelling}
                                        >
                                            {isCancelling === sub.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Cancel'}
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                        onClick={() => handleDelete(sub.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">No active subscriptions.</p>
                )}
            </CardContent>
        </Card>
    )
}
