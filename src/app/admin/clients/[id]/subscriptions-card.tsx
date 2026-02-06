'use client'

import { useState, useEffect } from "react"
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
import { Loader2, Plus, CreditCard, Calendar, Trash2, Link as LinkIcon, ExternalLink, CheckCircle2, AlertCircle, XCircle, ChevronDown, ChevronUp, Receipt } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { createSubscriptionCheckoutSession } from "./stripe-actions"
import { toast } from "sonner"
import { StripeSubscriptionStatus } from "./stripe-subscription-status"
import { createInvoicesFromStripe } from "./create-invoices-action"
import { checkRefundStatuses } from "./check-refund-status"



interface SubscriptionsCardProps {
    clientId: string;
    clientName?: string;
    clientEmail?: string;
    subscriptions: any[];
    availableServices: any[];
    stripeStatuses?: Record<string, StripeSubscriptionStatus | null>;
    subscriptionInvoices?: any[];
}

export function SubscriptionsCard({ clientId, clientName, clientEmail, subscriptions, availableServices, stripeStatuses = {}, subscriptionInvoices = [] }: SubscriptionsCardProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isCancelling, setIsCancelling] = useState<string | null>(null)
    const [isGeneratingLink, setIsGeneratingLink] = useState<string | null>(null)
    const [isCreatingInvoices, setIsCreatingInvoices] = useState<string | null>(null)
    const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({})
    const [refundStatuses, setRefundStatuses] = useState<Record<string, boolean>>({})
    const router = useRouter()

    // Check refund statuses for all invoices with payment intents
    useEffect(() => {
        const paymentIntentIds = subscriptionInvoices
            .map(inv => inv.stripe_payment_intent_id)
            .filter((id): id is string => id !== null && id !== undefined);
        
        if (paymentIntentIds.length > 0) {
            checkRefundStatuses(paymentIntentIds).then(setRefundStatuses);
        }
    }, [subscriptionInvoices])

    // Match invoices to subscriptions and filter out refunded payments
    // SIMPLIFIED: If there's only one subscription, show all subscription invoices
    // Otherwise, try to match by service name
    const getSubscriptionPayments = (subscription: any) => {
        if (!subscription) return []
        
        // Filter out refunded invoices
        const filteredInvoices = subscriptionInvoices.filter(inv => {
            // If invoice has a payment intent ID, check if it was refunded
            if (inv.stripe_payment_intent_id && refundStatuses[inv.stripe_payment_intent_id]) {
                return false; // Filter out refunded payments
            }
            return true;
        });
        
        // If only one subscription, show all subscription invoices (simplest approach)
        if (subscriptions.length === 1) {
            return filteredInvoices
        }
        
        // Multiple subscriptions - try to match by service name
        if (!subscription.services?.name) {
            // No service name - return empty or all? Let's return all for now
            return filteredInvoices
        }
        
        const serviceName = subscription.services.name
        
        // Match invoices that contain the service name in the description (case-insensitive)
        const exactMatches = filteredInvoices.filter(inv => {
            if (!inv.description) return false
            const description = inv.description.toLowerCase()
            const searchName = `Subscription Renewal: ${serviceName}`.toLowerCase()
            return description.includes(searchName)
        })
        
        // If no exact matches but we have invoices, show all (fallback)
        return exactMatches.length > 0 ? exactMatches : filteredInvoices
    }

    // Check if subscription is paid for current month
    const isPaidForCurrentMonth = (subscription: any, stripeStatus: any) => {
        if (!subscription || subscription.status === 'cancelled') return true; // Cancelled subscriptions don't need payment
        
        // Get payments (already filtered to exclude refunded)
        const payments = getSubscriptionPayments(subscription);
        
        // If Stripe linked, check if there's a paid invoice for current period
        if (stripeStatus?.currentPeriodStart && stripeStatus?.currentPeriodEnd) {
            const periodStart = new Date(stripeStatus.currentPeriodStart);
            const periodEnd = new Date(stripeStatus.currentPeriodEnd);
            const now = new Date();
            
            // Check if we're in the current billing period
            if (now >= periodStart && now <= periodEnd) {
                // Check if there's a paid invoice within this period (excluding refunded)
                const hasPaymentInPeriod = payments.some((inv: any) => {
                    const invDate = new Date(inv.created_at);
                    const isRefunded = inv.stripe_payment_intent_id && refundStatuses[inv.stripe_payment_intent_id];
                    return invDate >= periodStart && invDate <= periodEnd && inv.status === 'paid' && !isRefunded;
                });
                
                // Also check Stripe status (but only if we don't have refunded payments)
                if (stripeStatus.latestInvoiceStatus === 'paid' && stripeStatus.lastPaymentDate) {
                    const lastPayment = new Date(stripeStatus.lastPaymentDate);
                    if (lastPayment >= periodStart) {
                        // Double-check this payment wasn't refunded
                        const lastPaymentIntent = payments.find((inv: any) => {
                            const invDate = new Date(inv.created_at);
                            return Math.abs(invDate.getTime() - lastPayment.getTime()) < 24 * 60 * 60 * 1000; // Within 24 hours
                        });
                        if (!lastPaymentIntent || !(lastPaymentIntent.stripe_payment_intent_id && refundStatuses[lastPaymentIntent.stripe_payment_intent_id])) {
                            return true;
                        }
                    }
                }
                
                return hasPaymentInPeriod;
            }
        }
        
        // If not Stripe linked, check if there's a payment within the last month (excluding refunded)
        if (subscription.start_date) {
            const startDate = new Date(subscription.start_date);
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            
            return payments.some((inv: any) => {
                const invDate = new Date(inv.created_at);
                const isRefunded = inv.stripe_payment_intent_id && refundStatuses[inv.stripe_payment_intent_id];
                return invDate >= oneMonthAgo && inv.status === 'paid' && !isRefunded;
            });
        }
        
        // If subscription just started and no payments yet, it's not paid
        if (subscription.start_date) {
            const startDate = new Date(subscription.start_date);
            const now = new Date();
            // If started less than a month ago and no payments, not paid
            if (now.getTime() - startDate.getTime() < 30 * 24 * 60 * 60 * 1000) {
                return payments.length > 0 && payments.some((inv: any) => {
                    const isRefunded = inv.stripe_payment_intent_id && refundStatuses[inv.stripe_payment_intent_id];
                    return inv.status === 'paid' && !isRefunded;
                });
            }
        }
        
        return false; // Default to not paid if we can't determine
    }

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

    const handleCreateInvoices = async (subscriptionId: string) => {
        setIsCreatingInvoices(subscriptionId)
        try {
            const result = await createInvoicesFromStripe(subscriptionId)
            router.refresh()
            toast.success(`Created ${result.created} invoice(s) from Stripe. ${result.skipped} already existed.`)
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to create invoices')
        } finally {
            setIsCreatingInvoices(null)
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
                        {subscriptions.map((sub) => {
                            const stripeStatus = sub.stripe_subscription_id ? stripeStatuses[sub.stripe_subscription_id] : null;
                            
                            // Determine payment status badge
                            const getPaymentStatusBadge = () => {
                                // Get valid (non-refunded) payments - this already filters refunded
                                const payments = getSubscriptionPayments(sub);
                                
                                // If subscription is active, check if it's paid
                                if (sub.status === 'active') {
                                    // Count valid (non-refunded) payments
                                    const validPayments = payments.filter((inv: any) => {
                                        const isRefunded = inv.stripe_payment_intent_id && refundStatuses[inv.stripe_payment_intent_id];
                                        return inv.status === 'paid' && !isRefunded;
                                    });
                                    
                                    // If no valid payments, show "Not Paid"
                                    if (validPayments.length === 0) {
                                        return (
                                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                                                <XCircle className="h-3 w-3" />
                                                Not Paid
                                            </Badge>
                                        );
                                    }
                                    
                                    // If we have valid payments, show "Paid"
                                    return (
                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Paid
                                        </Badge>
                                    );
                                }
                                
                                // Handle Stripe-specific statuses for non-active subscriptions
                                if (stripeStatus) {
                                    if (stripeStatus.status === 'past_due' || stripeStatus.latestInvoiceStatus === 'open') {
                                        return (
                                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Past Due
                                            </Badge>
                                        );
                                    }
                                    
                                    if (stripeStatus.status === 'unpaid' || stripeStatus.latestInvoiceStatus === 'uncollectible') {
                                        return (
                                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                                                <XCircle className="h-3 w-3" />
                                                Unpaid
                                            </Badge>
                                        );
                                    }
                                }
                                
                                return null;
                            };
                            
                            return (
                                <div key={sub.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex-1">
                                        <h4 className="font-semibold flex items-center gap-2 mb-1">
                                            {sub.services?.name || 'Unknown Service'}
                                            {sub.stripe_subscription_id && (
                                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                                    Stripe Linked
                                                </Badge>
                                            )}
                                            {getPaymentStatusBadge()}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                                            <span className="flex items-center gap-1">
                                                <CreditCard className="h-3 w-3" />
                                                CHF {sub.amount}
                                                <span className="text-xs ml-1">/{sub.services?.billing_type === 'monthly' ? 'mo' : 'yr'}</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {sub.status === 'cancelled' ? (
                                                    <span>
                                                        {stripeStatus?.status === 'canceled' && stripeStatus?.currentPeriodEnd 
                                                            ? `Ended ${format(stripeStatus.currentPeriodEnd, 'PP')}`
                                                            : stripeStatus?.cancelAtPeriodEnd && stripeStatus?.currentPeriodEnd
                                                            ? `Ends ${format(stripeStatus.currentPeriodEnd, 'PP')}`
                                                            : 'Cancelled'}
                                                    </span>
                                                ) : (
                                                    <span>Started {sub.start_date ? format(new Date(sub.start_date), 'PP') : 'Unknown'}</span>
                                                )}
                                            </span>
                                            {sub.status === 'cancelled' ? (
                                                <>
                                                    {stripeStatus?.cancelAtPeriodEnd && stripeStatus?.currentPeriodEnd ? (
                                                        <span className="flex items-center gap-1 text-orange-600">
                                                            <AlertCircle className="h-3 w-3" />
                                                            Cancels on: {format(stripeStatus.currentPeriodEnd, 'MMM d, yyyy')}
                                                        </span>
                                                    ) : stripeStatus?.status === 'canceled' ? (
                                                        <span className="flex items-center gap-1 text-gray-600">
                                                            <XCircle className="h-3 w-3" />
                                                            Cancelled in Stripe
                                                        </span>
                                                    ) : null}
                                                    {stripeStatus?.lastPaymentDate && (
                                                        <span className="flex items-center gap-1 text-green-600">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Last paid: {format(stripeStatus.lastPaymentDate, 'MMM d, yyyy')}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {(() => {
                                                        // Calculate next payment date based on subscription start_date, not Stripe's period
                                                        let nextPaymentDate: Date | null = null;
                                                        if (sub.start_date) {
                                                            const startDate = new Date(sub.start_date);
                                                            const now = new Date();
                                                            const billingType = sub.services?.billing_type || 'monthly';
                                                            
                                                            // Calculate how many billing periods have passed
                                                            let periodsPassed = 0;
                                                            if (billingType === 'monthly') {
                                                                const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + 
                                                                                   (now.getMonth() - startDate.getMonth());
                                                                periodsPassed = monthsDiff;
                                                            } else if (billingType === 'yearly') {
                                                                const yearsDiff = now.getFullYear() - startDate.getFullYear();
                                                                periodsPassed = yearsDiff;
                                                            }
                                                            
                                                            // Next payment is start_date + (periodsPassed + 1) periods
                                                            const nextDate = new Date(startDate);
                                                            if (billingType === 'monthly') {
                                                                nextDate.setMonth(startDate.getMonth() + periodsPassed + 1);
                                                            } else {
                                                                nextDate.setFullYear(startDate.getFullYear() + periodsPassed + 1);
                                                            }
                                                            nextPaymentDate = nextDate;
                                                        } else {
                                                            // Fallback to Stripe's next payment date
                                                            nextPaymentDate = stripeStatus?.nextPaymentDate || null;
                                                        }
                                                        
                                                        return nextPaymentDate && !stripeStatus?.cancelAtPeriodEnd ? (
                                                            <span className="flex items-center gap-1 text-blue-600">
                                                                <Calendar className="h-3 w-3" />
                                                                Next payment: {format(nextPaymentDate, 'MMM d, yyyy')}
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                    {stripeStatus?.cancelAtPeriodEnd && stripeStatus?.currentPeriodEnd && (
                                                        <span className="flex items-center gap-1 text-orange-600">
                                                            <AlertCircle className="h-3 w-3" />
                                                            Cancels on: {format(stripeStatus.currentPeriodEnd, 'MMM d, yyyy')}
                                                        </span>
                                                    )}
                                                    {stripeStatus?.lastPaymentDate && (
                                                        <span className="flex items-center gap-1 text-green-600">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Last paid: {format(stripeStatus.lastPaymentDate, 'MMM d, yyyy')}
                                                        </span>
                                                    )}
                                                    {(() => {
                                                        // Only show amount due if:
                                                        // 1. Latest invoice is NOT paid (open/past_due)
                                                        // 2. AND we're past the next payment date
                                                        // 3. AND subscription is not cancelled
                                                        if (stripeStatus?.cancelAtPeriodEnd) return null;
                                                        
                                                        const isInvoicePaid = stripeStatus?.latestInvoiceStatus === 'paid';
                                                        const hasAmountDue = stripeStatus?.amountDue && stripeStatus.amountDue > 0;
                                                        
                                                        // Calculate next payment date
                                                        let nextPaymentDate: Date | null = null;
                                                        if (sub.start_date) {
                                                            const startDate = new Date(sub.start_date);
                                                            const now = new Date();
                                                            const billingType = sub.services?.billing_type || 'monthly';
                                                            
                                                            let periodsPassed = 0;
                                                            if (billingType === 'monthly') {
                                                                const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + 
                                                                                   (now.getMonth() - startDate.getMonth());
                                                                periodsPassed = monthsDiff;
                                                            } else {
                                                                const yearsDiff = now.getFullYear() - startDate.getFullYear();
                                                                periodsPassed = yearsDiff;
                                                            }
                                                            
                                                            const nextDate = new Date(startDate);
                                                            if (billingType === 'monthly') {
                                                                nextDate.setMonth(startDate.getMonth() + periodsPassed + 1);
                                                            } else {
                                                                nextDate.setFullYear(startDate.getFullYear() + periodsPassed + 1);
                                                            }
                                                            nextPaymentDate = nextDate;
                                                        } else {
                                                            nextPaymentDate = stripeStatus?.nextPaymentDate || null;
                                                        }
                                                        
                                                        const isPastDueDate = nextPaymentDate && new Date() >= nextPaymentDate;
                                                        
                                                        // Show amount due only if invoice is not paid AND we're past due date
                                                        if (hasAmountDue && !isInvoicePaid && isPastDueDate) {
                                                            return (
                                                                <span className="flex items-center gap-1 text-amber-600 font-medium">
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    Amount due: CHF {stripeStatus.amountDue.toFixed(2)}
                                                                </span>
                                                            );
                                                        }
                                                        
                                                        return null;
                                                    })()}
                                                </>
                                            )}
                                        </div>
                                        
                                    {/* Payment History / Payment Log */}
                                    <div className="mt-3 pt-3 border-t">
                                        {(() => {
                                            const payments = getSubscriptionPayments(sub)
                                            
                                            // Debug: Show all subscription invoices if no matches found
                                            const allSubscriptionInvoices = subscriptionInvoices.length
                                            const matchedPayments = payments.length
                                            
                                            return (
                                                <>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                                            <Receipt className="h-3 w-3" />
                                                            Payment Log
                                                            {matchedPayments === 0 && allSubscriptionInvoices > 0 && (
                                                                <span className="text-xs text-amber-600 ml-1">
                                                                    ({allSubscriptionInvoices} total subscription invoices found)
                                                                </span>
                                                            )}
                                                        </span>
                                                        {(payments.length > 0 || allSubscriptionInvoices > 0) && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                                                onClick={() => setExpandedPayments(prev => ({
                                                                    ...prev,
                                                                    [sub.id]: !prev[sub.id]
                                                                }))}
                                                            >
                                                                {payments.length > 0 ? (
                                                                    <>
                                                                        {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {allSubscriptionInvoices} subscription invoice{allSubscriptionInvoices !== 1 ? 's' : ''} found
                                                                    </>
                                                                )}
                                                                {expandedPayments[sub.id] ? (
                                                                    <ChevronUp className="h-3 w-3 ml-1" />
                                                                ) : (
                                                                    <ChevronDown className="h-3 w-3 ml-1" />
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                    
                                                    {payments.length === 0 && allSubscriptionInvoices === 0 ? (
                                                        <div className="text-xs text-muted-foreground py-2 space-y-2">
                                                            <div>No payments recorded yet.</div>
                                                            {(sub.stripe_subscription_id || sub.services?.stripe_price_id) && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 text-xs"
                                                                    onClick={() => handleCreateInvoices(sub.id)}
                                                                    disabled={isCreatingInvoices === sub.id}
                                                                >
                                                                    {isCreatingInvoices === sub.id ? (
                                                                        <>
                                                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                                            Creating...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Receipt className="h-3 w-3 mr-1" />
                                                                            Create Invoices from Stripe
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            )}
                                                            {!sub.stripe_subscription_id && !sub.services?.stripe_price_id && (
                                                                <div className="text-amber-600 mt-1">
                                                                    ⚠️ Subscription not linked to Stripe. Link payment first.
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        expandedPayments[sub.id] && (
                                                            <div className="mt-2 space-y-2">
                                                                {payments.length > 0 ? (
                                                                    // Show matched payments (excluding refunded)
                                                                    payments.map((invoice: any) => {
                                                                        const isRefunded = invoice.stripe_payment_intent_id && refundStatuses[invoice.stripe_payment_intent_id];
                                                                        return (
                                                                            <div
                                                                                key={invoice.id}
                                                                                className={`flex items-center justify-between text-xs rounded p-2 ${isRefunded ? 'bg-red-50 opacity-60' : 'bg-muted/50'}`}
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    {isRefunded ? (
                                                                                        <XCircle className="h-3 w-3 text-red-600" />
                                                                                    ) : (
                                                                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                                                    )}
                                                                                    <span className="text-muted-foreground">
                                                                                        {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                                                                                    </span>
                                                                                    <span className={`font-medium ${isRefunded ? 'line-through text-red-600' : ''}`}>
                                                                                        {invoice.currency} {invoice.amount.toFixed(2)}
                                                                                    </span>
                                                                                    <span className="text-xs text-muted-foreground">
                                                                                        ({invoice.description})
                                                                                    </span>
                                                                                    {isRefunded && (
                                                                                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                                                                            Refunded
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                                <Link
                                                                                    href={`/admin/invoices/${invoice.id}`}
                                                                                    className="text-primary hover:underline text-xs"
                                                                                >
                                                                                    View Invoice
                                                                                </Link>
                                                                            </div>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    // Show all subscription invoices if no matches (for debugging)
                                                                    <>
                                                                        <div className="text-xs text-amber-600 mb-2">
                                                                            ⚠️ Could not match invoices to this subscription. Showing all subscription invoices:
                                                                        </div>
                                                                        {subscriptionInvoices.map((invoice: any) => (
                                                                            <div
                                                                                key={invoice.id}
                                                                                className="flex items-center justify-between text-xs bg-muted/50 rounded p-2"
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                                                    <span className="text-muted-foreground">
                                                                                        {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                                                                                    </span>
                                                                                    <span className="font-medium">
                                                                                        {invoice.currency} {invoice.amount.toFixed(2)}
                                                                                    </span>
                                                                                    <span className="text-xs text-muted-foreground">
                                                                                        ({invoice.description})
                                                                                    </span>
                                                                                </div>
                                                                                <Link
                                                                                    href={`/admin/invoices/${invoice.id}`}
                                                                                    className="text-primary hover:underline text-xs"
                                                                                >
                                                                                    View Invoice
                                                                                </Link>
                                                                            </div>
                                                                        ))}
                                                                    </>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </>
                                            )
                                        })()}
                                    </div>
                                    </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                                        {sub.status}
                                    </Badge>

                                    {/* View in Stripe Button */}
                                    {sub.stripe_subscription_id && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-2"
                                            onClick={() => window.open(`https://dashboard.stripe.com/subscriptions/${sub.stripe_subscription_id}`, '_blank')}
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            View in Stripe
                                        </Button>
                                    )}

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
                        )})}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">No active subscriptions.</p>
                )}
            </CardContent>
        </Card>
    )
}
