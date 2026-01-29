"use client";

import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

function formatDate(date: string | Date, locale: string) {
    const d = new Date(date);
    return d.toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'de-CH');
}

function statusBadgeClass(status: string): string {
    switch (status) {
        case "paid":
            return "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/20";
        case "partial":
            return "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300 dark:bg-amber-500/20";
        case "overdue":
            return "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300 dark:bg-red-500/20";
        case "pending":
        case "draft":
        default:
            return "border-slate-500/40 bg-slate-500/15 text-slate-600 dark:text-slate-300 dark:bg-slate-500/20";
    }
}

interface ClientInvoicesViewProps {
    invoices: any[];
}

export function ClientInvoicesView({ invoices }: ClientInvoicesViewProps) {
    const { t, locale } = useLanguage();

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 w-full min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">{t.invoices.myInvoices}</h1>

            <div className="grid gap-3 sm:gap-4 w-full min-w-0">
                {invoices?.map((invoice) => (
                    <Card key={invoice.id} className="hover:bg-muted/50 transition-colors overflow-hidden">
                        <CardContent className="p-3 sm:p-6 flex flex-col gap-4">
                            {/* Row 1: Invoice ID + status badge */}
                            <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-base sm:text-lg truncate min-w-0">
                                    {t.invoices.invoice} #{invoice.id.slice(0, 8)}
                                </span>
                                <Badge
                                    variant="outline"
                                    className={cn("text-[10px] sm:text-xs font-medium capitalize shrink-0", statusBadgeClass(invoice.status))}
                                >
                                    {t.invoices.statusMap[invoice.status as keyof typeof t.invoices.statusMap] || invoice.status}
                                </Badge>
                            </div>

                            <div className="text-xs sm:text-sm text-muted-foreground">
                                {formatDate(invoice.created_at, locale)} · {invoice.description || "Consulting Services"}
                            </div>

                            {invoice.due_date && (
                                <div className="text-xs text-muted-foreground">
                                    {t.invoices.due}: {formatDate(invoice.due_date, locale)}
                                </div>
                            )}

                            {/* Amount + partial paid */}
                            <div className="flex flex-col gap-1.5">
                                <div className="font-bold text-lg sm:text-xl">
                                    {invoice.currency} {invoice.amount.toLocaleString()}
                                </div>
                                {invoice.status === 'partial' && (invoice.amount_paid ?? 0) > 0 && (
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">
                                            {t.invoices.paidAmount}: {invoice.currency} {(invoice.amount_paid || 0).toLocaleString()}
                                        </div>
                                        <div className="w-full max-w-[200px] sm:max-w-none bg-secondary h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-primary h-full rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(((invoice.amount_paid || 0) / invoice.amount) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button variant="outline" size="sm" className="w-full sm:w-auto shrink-0" asChild>
                                <Link href={`/invoices/${invoice.id}`}>{t.invoices.viewDetails}</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {!invoices?.length && (
                    <div className="text-center py-8 sm:py-12 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                        <p className="text-sm sm:text-base">{t.common.noData}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
