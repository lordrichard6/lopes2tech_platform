'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Calendar, CheckCircle2, AlertCircle, XCircle, ExternalLink, Loader2, Receipt, ChevronDown, ChevronUp } from "lucide-react"
import { format } from "date-fns"
import { ptBR, de, enUS } from "date-fns/locale"
import { StripeSubscriptionStatus } from "@/app/admin/clients/[id]/stripe-subscription-status"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useState } from "react"
import { createClientSubscriptionCheckout } from "@/app/(client)/subscriptions/actions"
import { toast } from "sonner"

const localeMap = {
    en: enUS,
    pt: ptBR,
    de: de,
} as const

interface ClientSubscriptionsViewProps {
    subscriptions: any[]
    stripeStatuses?: Record<string, StripeSubscriptionStatus | null>
    subscriptionInvoices?: any[]
}

export function ClientSubscriptionsView({ subscriptions, stripeStatuses = {}, subscriptionInvoices = [] }: ClientSubscriptionsViewProps) {
    const { t, locale } = useLanguage()
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({})

    // Match invoices to subscriptions
    // SIMPLIFIED: If there's only one subscription, show all subscription invoices
    // Otherwise, try to match by service name
    const getSubscriptionPayments = (subscription: any) => {
        if (!subscription) return []
        
        // If only one subscription, show all subscription invoices (simplest approach)
        if (subscriptions.length === 1) {
            return subscriptionInvoices
        }
        
        // Multiple subscriptions - try to match by service name
        if (!subscription.services?.name) {
            // No service name - return all subscription invoices as fallback
            return subscriptionInvoices
        }
        
        const serviceName = subscription.services.name
        
        // Match invoices that contain the service name in the description (case-insensitive)
        const exactMatches = subscriptionInvoices.filter(inv => {
            if (!inv.description) return false
            const description = inv.description.toLowerCase()
            const searchName = `Subscription Renewal: ${serviceName}`.toLowerCase()
            return description.includes(searchName)
        })
        
        // If no exact matches but we have invoices, show all (fallback)
        return exactMatches.length > 0 ? exactMatches : subscriptionInvoices
    }

    const handlePayNow = async (subscriptionId: string) => {
        setProcessingId(subscriptionId)
        try {
            const result = await createClientSubscriptionCheckout(subscriptionId)
            if (result.url) {
                window.location.href = result.url
            }
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || t.common.error)
            setProcessingId(null)
        }
    }

    const needsPayment = (sub: any, stripeStatus: StripeSubscriptionStatus | null) => {
        // If not linked to Stripe, show pay button if service has stripe_price_id
        if (!sub.stripe_subscription_id && sub.services?.stripe_price_id) {
            return true
        }
        // If linked to Stripe and has amount due or is past due
        if (stripeStatus && (stripeStatus.amountDue > 0 || stripeStatus.status === 'past_due' || stripeStatus.latestInvoiceStatus === 'open')) {
            return true
        }
        return false
    }

    const getPaymentStatusBadge = (stripeStatus: StripeSubscriptionStatus | null) => {
        if (!stripeStatus) return null
        
        if (stripeStatus.status === 'active' && stripeStatus.latestInvoiceStatus === 'paid') {
            return (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t.subscriptions.paid}
                </Badge>
            )
        }
        
        if (stripeStatus.status === 'past_due' || stripeStatus.latestInvoiceStatus === 'open') {
            return (
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {t.subscriptions.pastDue}
                </Badge>
            )
        }
        
        if (stripeStatus.status === 'unpaid' || stripeStatus.latestInvoiceStatus === 'uncollectible') {
            return (
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {t.subscriptions.unpaid}
                </Badge>
            )
        }
        
        return null
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t.subscriptions.title}</h1>
                <p className="text-muted-foreground mt-1">
                    {t.subscriptions.subtitle}
                </p>
            </div>

            {subscriptions && subscriptions.length > 0 ? (
                <div className="grid gap-4">
                    {subscriptions.map((sub) => {
                        const stripeStatus = sub.stripe_subscription_id ? stripeStatuses[sub.stripe_subscription_id] : null
                        
                        return (
                            <Card key={sub.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="flex items-center gap-2 mb-1">
                                                {sub.services?.name || t.subscriptions.unknown}
                                                {sub.stripe_subscription_id && (
                                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                                        {t.subscriptions.stripeLinked}
                                                    </Badge>
                                                )}
                                                {getPaymentStatusBadge(stripeStatus)}
                                            </CardTitle>
                                            <CardDescription>
                                                {sub.services?.description || t.subscriptions.noDescription}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                                            {sub.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <CreditCard className="h-3 w-3" />
                                            CHF {sub.amount}
                                            <span className="text-xs ml-1">/{sub.services?.billing_type === 'monthly' ? 'mo' : 'yr'}</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {sub.status === 'cancelled' ? (
                                                <span>{t.subscriptions.ended} {sub.updated_at ? format(new Date(sub.updated_at), 'MMM d, yyyy', { locale: localeMap[locale as keyof typeof localeMap] }) : t.subscriptions.unknown}</span>
                                            ) : (
                                                <span>{t.subscriptions.started} {sub.start_date ? format(new Date(sub.start_date), 'MMM d, yyyy', { locale: localeMap[locale as keyof typeof localeMap] }) : t.subscriptions.unknown}</span>
                                            )}
                                        </span>
                                        {stripeStatus?.nextPaymentDate && (
                                            <span className="flex items-center gap-1 text-blue-600">
                                                <Calendar className="h-3 w-3" />
                                                {t.subscriptions.nextPayment}: {format(stripeStatus.nextPaymentDate, 'MMM d, yyyy', { locale: localeMap[locale as keyof typeof localeMap] })}
                                            </span>
                                        )}
                                        {stripeStatus?.lastPaymentDate && (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <CheckCircle2 className="h-3 w-3" />
                                                {t.subscriptions.lastPaid}: {format(stripeStatus.lastPaymentDate, 'MMM d, yyyy', { locale: localeMap[locale as keyof typeof localeMap] })}
                                            </span>
                                        )}
                                        {stripeStatus?.amountDue && stripeStatus.amountDue > 0 && (
                                            <span className="flex items-center gap-1 text-amber-600 font-medium">
                                                <AlertCircle className="h-3 w-3" />
                                                {t.subscriptions.amountDue}: CHF {stripeStatus.amountDue.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Payment History / Payment Log */}
                                    <div className="mt-4 pt-4 border-t">
                                        {(() => {
                                            const payments = getSubscriptionPayments(sub)
                                            
                                            return (
                                                <>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                                            <Receipt className="h-3 w-3" />
                                                            {t.subscriptions.paymentLog || 'Payment Log'}
                                                        </span>
                                                        {payments.length > 0 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                                                onClick={() => setExpandedPayments(prev => ({
                                                                    ...prev,
                                                                    [sub.id]: !prev[sub.id]
                                                                }))}
                                                            >
                                                                {payments.length} {t.subscriptions.payment || 'payment'}{payments.length !== 1 ? 's' : ''} {t.subscriptions.recorded || 'recorded'}
                                                                {expandedPayments[sub.id] ? (
                                                                    <ChevronUp className="h-3 w-3 ml-1" />
                                                                ) : (
                                                                    <ChevronDown className="h-3 w-3 ml-1" />
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                    
                                                    {payments.length === 0 ? (
                                                        <div className="text-xs text-muted-foreground py-2">
                                                            {t.subscriptions.noPaymentsYet || 'No payments recorded yet. Payments will appear here after payment is processed.'}
                                                        </div>
                                                    ) : (
                                                        expandedPayments[sub.id] && (
                                                            <div className="mt-2 space-y-2">
                                                                {payments.map((invoice: any) => (
                                                                    <div
                                                                        key={invoice.id}
                                                                        className="flex items-center justify-between text-xs bg-muted/50 rounded p-2"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                                            <span className="text-muted-foreground">
                                                                                {format(new Date(invoice.created_at), 'MMM d, yyyy', { locale: localeMap[locale as keyof typeof localeMap] })}
                                                                            </span>
                                                                            <span className="font-medium">
                                                                                {invoice.currency} {invoice.amount.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                        <Link
                                                                            href={`/invoices/${invoice.id}`}
                                                                            className="text-primary hover:underline text-xs"
                                                                        >
                                                                            {t.invoices.viewDetails || 'View Invoice'}
                                                                        </Link>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )
                                                    )}
                                                </>
                                            )
                                        })()}
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t flex gap-2">
                                        {needsPayment(sub, stripeStatus) && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => handlePayNow(sub.id)}
                                                disabled={processingId === sub.id}
                                            >
                                                {processingId === sub.id ? (
                                                    <>
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        {t.subscriptions.processing}
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="h-3 w-3" />
                                                        {t.subscriptions.payNow}
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                        {sub.stripe_subscription_id && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => {
                                                    window.open(`https://dashboard.stripe.com/subscriptions/${sub.stripe_subscription_id}`, '_blank')
                                                }}
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                {t.subscriptions.viewInStripe}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                            <p className="text-lg font-medium mb-2">{t.subscriptions.noSubscriptions}</p>
                            <p className="text-sm">{t.subscriptions.noSubscriptionsDesc}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
