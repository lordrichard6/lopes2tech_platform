import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin"; // Bypass RLS
import { cookies } from "next/headers";
import { dictionaries, Locale } from "@/lib/i18n/dictionaries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function InvoicesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const cookieStore = await cookies();
    const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'en') as Locale;
    const t = dictionaries[locale];

    if (!user) {
        redirect('/login');
    }

    // Bypass RLS to find the client linked to this user (by ID or Email)
    const adminDb = createAdminClient();

    // Find client
    const { data: client } = await adminDb
        .from('clients')
        .select('id, name')
        .or(`user_id.eq.${user.id},contact_email.ilike.${user.email}`)
        .single();

    let invoices: any[] = [];

    if (client) {
        // Fetch invoices for this client (bypassing RLS to ensure visibility)
        const { data, error } = await adminDb
            .from("invoices")
            .select("*, clients(name)")
            .eq('client_id', client.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            invoices = data;
        } else if (error) {
            console.error("Error fetching invoices:", error);
        }
    }

    return (
        <div className="space-y-6">
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
                                    <Link href={`/dashboard/invoices/${invoice.id}`}>{t.invoices.viewDetails}</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {!invoices?.length && (
                    <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                        {client ? (
                            <p>{t.common.noData}</p>
                        ) : (
                            <p>No client profile found for your account.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
