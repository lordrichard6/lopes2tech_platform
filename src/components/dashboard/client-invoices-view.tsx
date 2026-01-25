
"use client";

import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Locale } from "@/lib/i18n/dictionaries";

interface ClientInvoicesViewProps {
    invoices: any[];
}

export function ClientInvoicesView({ invoices }: ClientInvoicesViewProps) {
    const { t, locale } = useLanguage();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t.invoices.myInvoices}</h1>
            </div>

            <div className="grid gap-4">
                {invoices?.map((invoice) => (
                    <Card key={invoice.id} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="font-semibold text-lg flex items-center gap-2">
                                    {t.invoices.invoice} #{invoice.id.slice(0, 8)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {new Date(invoice.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'de-CH')}
                                </div>
                                <div className="text-sm">
                                    {invoice.description || "Consulting Services"}
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right min-w-[140px]">
                                    <div className="font-bold text-lg">{invoice.currency} {invoice.amount.toLocaleString()}</div>

                                    {invoice.status === 'partial' && (
                                        <div className="space-y-1.5 mt-2">
                                            <div className="text-xs font-medium text-green-600 dark:text-green-400 flex justify-end">
                                                {t.invoices.paidAmount}: {invoice.currency} {(invoice.amount_paid || 0).toLocaleString()}
                                            </div>
                                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(((invoice.amount_paid || 0) / invoice.amount) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {invoice.due_date && <div className="text-xs text-muted-foreground mt-1">{t.invoices.due}: {new Date(invoice.due_date).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'de-CH')}</div>}
                                </div>

                                <Badge
                                    className={`capitalize px-3 py-1 ${invoice.status === 'paid' ? 'bg-green-500 hover:bg-green-600' :
                                        invoice.status === 'partial' ? 'bg-blue-500 hover:bg-blue-600' :
                                            invoice.status === 'overdue' ? 'bg-red-500 hover:bg-red-600' :
                                                'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                        }`}
                                >
                                    {t.invoices.statusMap[invoice.status as keyof typeof t.invoices.statusMap] || invoice.status}
                                </Badge>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/invoices/${invoice.id}`}>{t.invoices.viewDetails}</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {!invoices?.length && (
                    <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                        <p>{t.common.noData}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
