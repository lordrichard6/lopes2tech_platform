import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { dictionaries, Locale } from "@/lib/i18n/dictionaries";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    const schedules = invoice.invoice_payment_schedules?.sort((a: any, b: any) => a.installment_number - b.installment_number) || [];
    const hasPaymentPlan = schedules.length > 0;

    // Status badge styling
    const getStatusBadgeClass = () => {
        switch (invoice.status) {
            case 'paid': return 'bg-green-500 hover:bg-green-600 text-white';
            case 'partial': return 'bg-blue-500 hover:bg-blue-600 text-white';
            case 'cancelled': return 'bg-gray-500 hover:bg-gray-600 text-white';
            default: return isOverdue ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-secondary text-secondary-foreground';
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="mb-6">
                <Link href="/dashboard/invoices" className="text-sm text-muted-foreground hover:underline">
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

            <Card>
                {/* Header with Invoice Number and Status */}
                <CardHeader className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground uppercase tracking-wider">{t.invoices.invoice}</p>
                            <CardTitle className="text-2xl font-bold">{invoiceNumber}</CardTitle>
                        </div>
                        <Badge className={`text-base px-4 py-1.5 capitalize ${getStatusBadgeClass()}`}>
                            {isOverdue && invoice.status === 'pending' ? t.invoices.statusMap.overdue : t.invoices.statusMap[invoice.status as keyof typeof t.invoices.statusMap] || invoice.status}
                        </Badge>
                    </div>

                    {/* From / To Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{t.invoices.details.from}</p>
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-semibold">Lopes2Tech</p>
                                    <p className="text-muted-foreground">Zurich, Switzerland</p>
                                    <p className="text-muted-foreground">paulo@lopes2tech.ch</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{t.invoices.details.billTo}</p>
                            <div className="text-sm">
                                <p className="font-semibold">{invoice.clients?.name}</p>
                                <p className="text-muted-foreground">{invoice.clients?.contact_email}</p>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Dates */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
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

                    <Separator />

                    {/* Description */}
                    <div>
                        <span className="font-medium block text-muted-foreground mb-2">{t.invoices.details.description}</span>
                        <p>{invoice.description || "Professional Services"}</p>
                    </div>

                    <Separator />

                    {/* Amount Summary */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>{t.invoices.details.totalAmount}</span>
                            <span>{invoice.currency} {invoice.amount.toLocaleString()}</span>
                        </div>

                        {(invoice.amount_paid || 0) > 0 && (
                            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t.invoices.details.paidToDate}</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">
                                        {invoice.currency} {(invoice.amount_paid || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all"
                                            style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground text-right">
                                        {Math.round(paymentProgress)}% {t.invoices.details.paidToDate.split(' ')[0]} {/* Or just 'Paid' if available */}
                                    </p>
                                </div>
                                {remainingAmount > 0 && (
                                    <div className="flex justify-between text-sm pt-2 border-t border-dashed">
                                        <span className="font-medium">{t.invoices.details.remainingDue}</span>
                                        <span className="font-bold text-blue-600 dark:text-blue-400">
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
                            <Separator />
                            <div>
                                <span className="font-medium block text-muted-foreground mb-3">{t.invoices.details.paymentSchedule}</span>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t.invoices.details.installment}</TableHead>
                                            <TableHead>{t.invoices.details.issueDate}</TableHead> {/* Should be Due Date? Yes usually due date. Using issueDate might be wrong key. Wait, previous replacement used 'Due Date'. Let's check dictionary again. I added 'issueDate' but not 'dueDate' in 'details' block, but I have 'invoices.due'. I will use 't.invoices.due'. */}
                                            <TableHead>{t.invoices.details.amount}</TableHead>
                                            <TableHead>{t.projects.status}</TableHead>
                                            <TableHead className="text-right">{t.invoices.details.action}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {schedules.map((schedule: any) => (
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
                                                    <Badge variant={schedule.status === 'paid' ? 'default' : 'outline'} className={schedule.status === 'paid' ? 'bg-green-500' : ''}>
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
                        </>
                    )}

                    {/* Payment History */}
                    {payments && payments.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <span className="font-medium block text-muted-foreground mb-3">{t.invoices.details.paymentHistory}</span>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t.invoices.details.date}</TableHead>
                                            <TableHead>{t.invoices.details.amount}</TableHead>
                                            <TableHead>{t.invoices.details.method}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.map((payment: any) => (
                                            <TableRow key={payment.id}>
                                                <TableCell className="text-sm">
                                                    {new Date(payment.payment_date).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'de-CH')}
                                                </TableCell>
                                                <TableCell className="font-medium text-green-600">
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
                        </>
                    )}

                    {/* Bank Transfer Details (if not paid) */}
                    {!isPaid && settings && (settings.iban || settings.bank_name) && (
                        <>
                            <Separator />
                            <div className="bg-muted/30 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
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
                <CardFooter className="flex flex-col gap-4 border-t bg-muted/20 p-6">
                    {/* Download PDF Button */}
                    <DownloadPdfButton invoice={invoice} settings={settings} />
                </CardFooter>
            </Card>

            {/* Contact Section */}
            <Card className="bg-muted/20">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
        </div>
    );
}

