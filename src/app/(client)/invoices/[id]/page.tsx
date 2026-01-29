import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { dictionaries, Locale } from "@/lib/i18n/dictionaries";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
    AlertTriangle, Download, CheckCircle2, FileText,
    Building2, Mail, Phone, Globe, CreditCard
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DownloadPdfButton } from "./download-pdf-button";
import { DownloadQRButton } from "./download-qr-button";
import { MarkPaidButton } from "./mark-paid-button";
import { MobilePaymentDialog } from "./mobile-payment-dialog";

export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const cookieStore = await cookies();
    const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'en') as Locale;
    const t = dictionaries[locale];

    if (!user) return redirect('/login');

    const adminDb = createAdminClient();

    // Fetch invoice with client info and project
    const { data: invoice } = await adminDb
        .from("invoices")
        .select("*, clients(*), projects(name), invoice_payment_schedules(*)")
        .eq("id", id)
        .single();

    if (!invoice) return notFound();

    // STRICT OWNERSHIP CHECK
    const isOwner =
        invoice.clients?.user_id === user.id ||
        invoice.clients?.contact_email?.toLowerCase() === user.email?.toLowerCase();

    if (!isOwner) return notFound();

    // Fetch payment history
    const { data: payments } = await adminDb
        .from("invoice_payments")
        .select("*")
        .eq("invoice_id", id)
        .order("payment_date", { ascending: false });

    // Fetch system settings for payment info
    const { data: settings } = await adminDb
        .from("system_settings")
        .select("*")
        .single();

    const remainingAmount = invoice.amount - (invoice.amount_paid || 0);
    const paymentProgress = invoice.amount > 0 ? ((invoice.amount_paid || 0) / invoice.amount) * 100 : 0;
    const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'paid';
    const isPaid = invoice.status === 'paid';
    const invoiceNumber = invoice.description?.match(/INV-[\w-]+/)?.[0] || `INV-${invoice.id.slice(0, 8).toUpperCase()}`;

    // Sort schedules
    const schedules = invoice.invoice_payment_schedules?.sort((a: { installment_number: number }, b: { installment_number: number }) => a.installment_number - b.installment_number) || [];
    const hasPaymentPlan = schedules.length > 0;

    // Status badge styling (aligned with list view: outline + subtle tint)
    const getStatusBadgeClass = () => {
        switch (invoice.status) {
            case 'paid': return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/20';
            case 'partial': return 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300 dark:bg-amber-500/20';
            case 'cancelled': return 'border-slate-500/40 bg-slate-500/15 text-slate-600 dark:text-slate-300 dark:bg-slate-500/20';
            default: return isOverdue
                ? 'border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300 dark:bg-red-500/20'
                : 'border-slate-500/40 bg-slate-500/15 text-slate-600 dark:text-slate-300 dark:bg-slate-500/20';
        }
    };

    return (
        <div className="w-full min-w-0 max-w-3xl mx-auto space-y-3 sm:space-y-6 px-0 sm:px-4 pb-20 sm:pb-12">
            <div className="mb-1 sm:mb-4">
                <Link href="/invoices" className="text-xs sm:text-sm text-muted-foreground hover:underline">
                    ← {t.invoices.details.backToInvoices}
                </Link>
            </div>

            {/* Paid Success Banner */}
            {isPaid && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <div>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                            Thank you for your payment!
                        </span>
                        <p className="text-sm text-muted-foreground">
                            This invoice has been paid in full.
                        </p>
                    </div>
                </div>
            )}

            {/* Overdue Warning Banner */}
            {isOverdue && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                        <span className="font-medium text-red-600 dark:text-red-400">
                            This invoice is overdue
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                            Due date was {format(new Date(invoice.due_date), 'MMMM d, yyyy')}
                        </span>
                    </div>
                </div>
            )}

            <Card className="overflow-hidden">
                {/* Header: Invoice #, Status, and on mobile a one-line amount/remaining */}
                <CardHeader className="space-y-3 p-3 sm:p-6">
                    <div className="flex flex-col gap-2 sm:gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wider">{t.invoices.invoice}</p>
                                <CardTitle className="text-lg sm:text-2xl font-bold truncate">{invoiceNumber}</CardTitle>
                            </div>
                            <Badge variant="outline" className={`text-[10px] sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1 capitalize shrink-0 ${getStatusBadgeClass()}`}>
                                {isOverdue && invoice.status === 'pending' ? t.invoices.statusMap.overdue : t.invoices.statusMap[invoice.status as keyof typeof t.invoices.statusMap] || invoice.status}
                            </Badge>
                        </div>
                        {/* Mobile: amount + remaining in one compact row */}
                        <div className="flex items-baseline justify-between gap-2 text-sm sm:hidden border-b pb-3">
                            <span className="font-bold">{invoice.currency} {invoice.amount.toLocaleString()}</span>
                            {remainingAmount > 0 && (
                                <span className="text-muted-foreground text-xs">{t.invoices.details.remainingDue}: <span className="font-semibold text-foreground">{invoice.currency} {remainingAmount.toLocaleString()}</span></span>
                            )}
                        </div>
                    </div>

                    {/* From / To: compact on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 pt-3 sm:pt-4 border-t">
                        <div>
                            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2">{t.invoices.details.from}</p>
                            <div className="flex items-start gap-2 sm:gap-3">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                </div>
                                <div className="text-xs sm:text-sm min-w-0">
                                    <p className="font-semibold truncate">Lopes2Tech</p>
                                    <p className="text-muted-foreground truncate">Zurich, Switzerland · paulo@lopes2tech.ch</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2">{t.invoices.details.billTo}</p>
                            <div className="text-xs sm:text-sm min-w-0">
                                <p className="font-semibold truncate">{invoice.clients?.name}</p>
                                <p className="text-muted-foreground truncate">{invoice.clients?.contact_email}</p>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3 sm:space-y-6 p-3 sm:p-6">
                    {/* Dates: one row on mobile */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-[11px] sm:text-sm">
                        <div>
                            <span className="font-medium block text-muted-foreground">{t.invoices.details.issueDate}</span>
                            <span>{new Date(invoice.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'de-CH')}</span>
                        </div>
                        {invoice.due_date && (
                            <div>
                                <span className="font-medium block text-muted-foreground">{t.invoices.due}</span>
                                <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                                    {new Date(invoice.due_date).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'de-CH')}
                                </span>
                            </div>
                        )}
                        {invoice.projects && (
                            <div>
                                <span className="font-medium block text-muted-foreground">{t.projects.title}</span> {/* Using existing project title 'Projects' or need detail 'Project'? Current dict has 'title'. Let's check dict. It has `projects.title`. */}
                                <span className="flex items-center gap-1">
                                    <FileText className="h-3.5 w-3.5" />
                                    {invoice.projects.name}
                                </span>
                            </div>
                        )}
                    </div>

                    <Separator className="my-2 sm:my-0" />

                    {/* Description */}
                    <div>
                        <span className="font-medium block text-muted-foreground mb-1 sm:mb-2 text-[11px] sm:text-sm">{t.invoices.details.description}</span>
                        <p className="text-sm sm:text-base">{invoice.description || "Professional Services"}</p>
                    </div>

                    <Separator className="my-2 sm:my-0" />

                    {/* Amount Summary: full block on desktop; on mobile total/remaining already in header */}
                    <div className="space-y-2 sm:space-y-4">
                        <div className="flex justify-between items-center text-base sm:text-lg font-bold hidden sm:flex">
                            <span>{t.invoices.details.totalAmount}</span>
                            <span>{invoice.currency} {invoice.amount.toLocaleString()}</span>
                        </div>

                        {(invoice.amount_paid || 0) > 0 && (
                            <div className="bg-muted/30 p-2.5 sm:p-4 rounded-lg space-y-1.5 sm:space-y-3">
                                <div className="flex justify-between text-[11px] sm:text-sm">
                                    <span className="text-muted-foreground">{t.invoices.details.paidToDate}</span>
                                    <span className="font-medium text-muted-foreground">
                                        {invoice.currency} {(invoice.amount_paid || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="space-y-0.5 sm:space-y-1">
                                    <div className="w-full bg-secondary h-1 sm:h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-primary h-full rounded-full transition-all"
                                            style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground text-right">
                                        {Math.round(paymentProgress)}% {t.invoices.details.paidToDate.split(' ')[0]}
                                    </p>
                                </div>
                                {remainingAmount > 0 && (
                                    <div className="flex justify-between text-[11px] sm:text-sm pt-1.5 sm:pt-2 border-t border-dashed">
                                        <span className="font-medium">{t.invoices.details.remainingDue}</span>
                                        <span className="font-bold">
                                            {invoice.currency} {remainingAmount.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Payment Schedule (if enabled) */}
                    {hasPaymentPlan && (
                        <>
                            <Separator className="my-2 sm:my-0" />
                            <div className="min-w-0">
                                <span className="font-medium block text-muted-foreground mb-2 sm:mb-3 text-xs sm:text-sm">{t.invoices.details.paymentSchedule}</span>
                                
                                {/* Mobile: card-based layout */}
                                <div className="space-y-2 sm:hidden">
                                    {schedules.map((schedule: { id: string; installment_number: number; amount: number; due_date: string; status: string; qr_reference?: string }) => (
                                        <div key={schedule.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium">#{schedule.installment_number} / {schedules.length}</span>
                                                <Badge variant="outline" className={`text-[10px] ${schedule.status === 'paid' ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : ''}`}>
                                                    {t.invoices.statusMap[schedule.status as keyof typeof t.invoices.statusMap] || schedule.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-bold">{invoice.currency} {schedule.amount.toLocaleString()}</span>
                                                <span className="text-muted-foreground text-xs">{t.invoices.due}: {new Date(schedule.due_date).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'de-CH')}</span>
                                            </div>
                                            {schedule.status !== 'paid' && (
                                                <div className="flex items-center gap-2 pt-1">
                                                    <DownloadQRButton schedule={schedule} invoice={invoice} settings={settings} />
                                                    <MarkPaidButton scheduleId={schedule.id} status={schedule.status} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop: table layout */}
                                <div className="hidden sm:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t.invoices.details.installment}</TableHead>
                                                <TableHead>{t.invoices.due}</TableHead>
                                                <TableHead>{t.invoices.details.amount}</TableHead>
                                                <TableHead>{t.projects.status}</TableHead>
                                                <TableHead className="text-right">{t.invoices.details.action}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {schedules.map((schedule: { id: string; installment_number: number; amount: number; due_date: string; status: string; qr_reference?: string }) => (
                                                <TableRow key={schedule.id}>
                                                    <TableCell className="text-sm font-medium">
                                                        #{schedule.installment_number} of {schedules.length}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {new Date(schedule.due_date).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'de-CH')}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {invoice.currency} {schedule.amount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={schedule.status === 'paid' ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : ''}>
                                                            {t.invoices.statusMap[schedule.status as keyof typeof t.invoices.statusMap] || schedule.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {schedule.status !== 'paid' && (
                                                                <DownloadQRButton schedule={schedule} invoice={invoice} settings={settings} />
                                                            )}
                                                            <MarkPaidButton scheduleId={schedule.id} status={schedule.status} />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Payment History */}
                    {payments && payments.length > 0 && (
                        <>
                            <Separator className="my-2 sm:my-0" />
                            <div className="min-w-0">
                                <span className="font-medium block text-muted-foreground mb-2 sm:mb-3 text-xs sm:text-sm">{t.invoices.details.paymentHistory}</span>
                                
                                {/* Mobile: compact list */}
                                <div className="space-y-2 sm:hidden">
                                    {payments.map((payment: { id: string; payment_date: string; amount: number; payment_method?: string }) => (
                                        <div key={payment.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-2.5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(payment.payment_date).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'de-CH')}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground capitalize">{payment.payment_method || 'Transfer'}</span>
                                            </div>
                                            <span className="font-medium text-sm text-muted-foreground">
                                                + {invoice.currency} {payment.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop: table */}
                                <div className="hidden sm:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t.invoices.details.date}</TableHead>
                                                <TableHead>{t.invoices.details.amount}</TableHead>
                                                <TableHead>{t.invoices.details.method}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.map((payment: { id: string; payment_date: string; amount: number; payment_method?: string }) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell className="text-sm">
                                                        {new Date(payment.payment_date).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'de-CH')}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-muted-foreground">
                                                        + {invoice.currency} {payment.amount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="capitalize text-sm text-muted-foreground">
                                                        {payment.payment_method || 'Transfer'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Bank Transfer Details (if not paid) */}
                    {!isPaid && settings && (settings.iban || settings.bank_name) && (
                        <>
                            <Separator />
                            <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{t.invoices.details.bankTransferDetails}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    {settings.bank_name && (
                                        <div>
                                            <span className="text-muted-foreground block">{t.invoices.details.bank}</span>
                                            <span className="font-medium">{settings.bank_name}</span>
                                        </div>
                                    )}
                                    {settings.account_holder && (
                                        <div>
                                            <span className="text-muted-foreground block">{t.invoices.details.accountHolder}</span>
                                            <span className="font-medium">{settings.account_holder}</span>
                                        </div>
                                    )}
                                    {settings.iban && (
                                        <div className="sm:col-span-2">
                                            <span className="text-muted-foreground block">IBAN</span>
                                            <span className="font-mono font-medium">{settings.iban}</span>
                                        </div>
                                    )}
                                    {settings.bic && (
                                        <div>
                                            <span className="text-muted-foreground block">BIC/SWIFT</span>
                                            <span className="font-mono font-medium">{settings.bic}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-3">
                                    {t.invoices.details.referenceNote.replace('{number}', invoiceNumber)} {/* Note: simple replace for now - usually need more robust interpolation if dict handles placeholders differently, but I used string value in plan. */}
                                    {!t.invoices.details.referenceNote.includes('{number}') && <span><strong>{invoiceNumber}</strong></span>} {/* Fallback if I messed up string def? No, I defined it with {number}. But React check is safer. Actually, let's just use a Replace if simpler. Or constructing the string: */}
                                    {/* Using a safer approach for interpolated string with React Element */}
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>

                {/* Footer Actions */}
                {/* Desktop only: Download button in footer */}
                <CardFooter className="hidden sm:flex flex-col gap-4 border-t bg-muted/20 p-6">
                    <DownloadPdfButton invoice={invoice} settings={settings} />
                </CardFooter>
            </Card>

            {/* Contact Section */}
            <Card className="bg-muted/20">
                <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left text-sm">
                        <div className="text-center sm:text-left">
                            <p className="font-medium">{t.invoices.details.questions}</p>
                            <p className="text-sm text-muted-foreground">{t.invoices.details.helpText}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <a
                                href="mailto:paulo@lopes2tech.ch"
                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                                <Mail className="h-4 w-4" />
                                paulo@lopes2tech.ch
                            </a>
                            <a
                                href="https://lopes2tech.ch"
                                target="_blank"
                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                                <Globe className="h-4 w-4" />
                                lopes2tech.ch
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Mobile: Fixed FAB + Payment Dialog */}
            {invoice.status !== 'paid' && (
                <MobilePaymentDialog
                    invoice={invoice}
                    schedules={schedules}
                    settings={settings}
                />
            )}
        </div>
    );
}

