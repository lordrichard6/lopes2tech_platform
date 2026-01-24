'use client';

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image,
} from '@react-pdf/renderer';
import { Currency, ServiceItem, formatPrice, getPriceForCurrency, getBasePrice } from '@/lib/data/pricing';

// Register Inter font (using system font fallback for simplicity)
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff2', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff2', fontWeight: 700 },
    ],
});

const translations = {
    EN: {
        title: 'PROPOSAL',
        date: 'Date',
        validUntil: 'Valid until',
        client: 'Client',
        from: 'From',
        servicesTitle: 'Proposed Services',
        colService: 'Service',
        colQty: 'Qty',
        colPrice: 'Unit Price',
        colTotal: 'Total',
        subtotal: 'Subtotal',
        discount: 'Discount',
        total: 'TOTAL',
        termsTitle: 'Terms & Conditions',
        notesTitle: 'Notes',
        footer: 'Lopes2Tech • Zurich, Switzerland • www.lopes2tech.ch • paulo@lopes2tech.ch',
        defaultTerms: '• 50% deposit to start\n• 50% on completion/delivery\n• Payment via bank transfer or TWINT\n• Changes outside scope will be quoted separately'
    },
    PT: {
        title: 'PROPOSTA',
        date: 'Data',
        validUntil: 'Válido até',
        client: 'Cliente',
        from: 'De',
        servicesTitle: 'Serviços Propostos',
        colService: 'Serviço',
        colQty: 'Qtd.',
        colPrice: 'Preço Unit.',
        colTotal: 'Total',
        subtotal: 'Subtotal',
        discount: 'Desconto',
        total: 'TOTAL',
        termsTitle: 'Termos & Condições',
        notesTitle: 'Notas',
        footer: 'Lopes2Tech • Zurique, Suíça • www.lopes2tech.ch • paulo@lopes2tech.ch',
        defaultTerms: '• 50% de depósito para iniciar o projeto\n• 50% no lançamento/entrega final\n• Pagamento via transferência bancária ou TWINT\n• Alterações fora do âmbito acordado serão cotadas separadamente'
    },
    DE: {
        title: 'ANGEBOT',
        date: 'Datum',
        validUntil: 'Gültig bis',
        client: 'Kunde',
        from: 'Von',
        servicesTitle: 'Vorgeschlagene Leistungen',
        colService: 'Leistung',
        colQty: 'Menge',
        colPrice: 'Einzelpreis',
        colTotal: 'Gesamt',
        subtotal: 'Zwischensumme',
        discount: 'Rabatt',
        total: 'GESAMT',
        termsTitle: 'Allgemeine Geschäftsbedingungen',
        notesTitle: 'Notizen',
        footer: 'Lopes2Tech • Zürich, Schweiz • www.lopes2tech.ch • paulo@lopes2tech.ch',
        defaultTerms: '• 50% Anzahlung bei Projektstart\n• 50% bei Fertigstellung/Lieferung\n• Zahlung per Banküberweisung oder TWINT\n• Änderungen außerhalb des Umfangs werden separat berechnet'
    }
};

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        paddingTop: 50,
        paddingBottom: 65,
        paddingHorizontal: 50,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#0891b2',
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    logoAccent: {
        color: '#0891b2',
    },
    headerRight: {
        textAlign: 'right',
    },
    offerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 5,
    },
    offerNumber: {
        fontSize: 10,
        color: '#64748b',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    clientInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    clientBox: {
        width: '48%',
    },
    label: {
        fontSize: 8,
        color: '#64748b',
        marginBottom: 3,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 10,
        color: '#0f172a',
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    tableRowAlt: {
        backgroundColor: '#fafafa',
    },
    colService: {
        width: '45%',
    },
    colQty: {
        width: '10%',
        textAlign: 'center',
    },
    colPrice: {
        width: '20%',
        textAlign: 'right',
    },
    colTotal: {
        width: '25%',
        textAlign: 'right',
    },
    headerText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    serviceText: {
        fontSize: 10,
        color: '#0f172a',
    },
    serviceDesc: {
        fontSize: 8,
        color: '#64748b',
        marginTop: 2,
    },
    totalsSection: {
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 2,
        borderTopColor: '#0891b2',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 5,
    },
    totalLabel: {
        fontSize: 10,
        color: '#64748b',
        width: 100,
        textAlign: 'right',
        marginRight: 20,
    },
    totalValue: {
        fontSize: 10,
        color: '#0f172a',
        width: 100,
        textAlign: 'right',
    },
    grandTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0891b2',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 8,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
    },
    terms: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
    },
    termsTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    termsList: {
        fontSize: 8,
        color: '#64748b',
        lineHeight: 1.5,
    },
    validityBadge: {
        backgroundColor: '#dcfce7',
        color: '#166534',
        padding: '4 8',
        borderRadius: 4,
        fontSize: 8,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
});

export interface OfferItem {
    service: ServiceItem;
    quantity: number;
    customPrice?: number;
}

export interface OfferData {
    offerNumber: string;
    date: string;
    validUntil: string;
    clientName: string;
    clientCompany?: string;
    clientEmail?: string;
    items: OfferItem[];
    currency: Currency;
    notes?: string;
    paymentTerms?: string;
    discount?: number;
    language: 'EN' | 'PT' | 'DE';
    title?: string; // Allow override
    bankDetails?: {
        bankName?: string | null;
        bankAddress?: string | null;
        accountHolder?: string | null;
        iban?: string | null;
        bic?: string | null;
        qrIban?: string | null;
        qrReference?: string | null;
    };
    paymentMethod?: 'BANK_TRANSFER' | 'QR_BILL';
    qrBillImage?: string; // Base64 SVG/PNG of the QR Bill
}

export function OfferPDFDocument({ data }: { data: OfferData }) {
    const currencySymbol = data.currency === 'CHF' ? 'CHF' : '€';
    const t = translations[data.language];

    const calculateItemTotal = (item: OfferItem): number => {
        const price = item.customPrice ?? getBasePrice(getPriceForCurrency(item.service, data.currency));
        return price * item.quantity;
    };

    const subtotal = data.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const discountAmount = data.discount ? subtotal * (data.discount / 100) : 0;
    const total = subtotal - discountAmount;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.logo}>
                            Lopes<Text style={styles.logoAccent}>2</Text>Tech
                        </Text>
                        <Text style={{ fontSize: 8, color: '#64748b', marginTop: 3 }}>
                            Web Development & Digital Solutions
                        </Text>
                    </View>

                    <View style={styles.headerRight}>
                        <Text style={styles.offerTitle}>{data.title || t.title}</Text>
                        <Text style={styles.offerNumber}>#{data.offerNumber}</Text>
                        <Text style={{ fontSize: 9, color: '#64748b', marginTop: 5 }}>
                            {data.date}
                        </Text>
                    </View>
                </View>

                {/* Client Info */}
                <View style={styles.clientInfo}>
                    <View style={styles.clientBox}>
                        <Text style={styles.label}>{t.client}</Text>
                        <Text style={styles.value}>{data.clientName}</Text>
                        {data.clientCompany && (
                            <Text style={[styles.value, { color: '#64748b', fontSize: 9 }]}>
                                {data.clientCompany}
                            </Text>
                        )}
                        {data.clientEmail && (
                            <Text style={[styles.value, { color: '#64748b', fontSize: 9, marginTop: 3 }]}>
                                {data.clientEmail}
                            </Text>
                        )}
                    </View>
                    <View style={styles.clientBox}>
                        <Text style={styles.label}>{t.from}</Text>
                        <Text style={styles.value}>Lopes2Tech</Text>
                        <Text style={[styles.value, { color: '#64748b', fontSize: 9 }]}>
                            {data.language === 'PT' ? 'Zurique, Suíça' : data.language === 'DE' ? 'Zürich, Schweiz' : 'Zurich, Switzerland'}
                        </Text>
                        <Text style={[styles.value, { color: '#64748b', fontSize: 9 }]}>
                            paulo@lopes2tech.ch
                        </Text>
                    </View>
                </View>

                {/* Services Table */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.servicesTitle}</Text>
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <View style={styles.colService}>
                                <Text style={styles.headerText}>{t.colService}</Text>
                            </View>
                            <View style={styles.colQty}>
                                <Text style={styles.headerText}>{t.colQty}</Text>
                            </View>
                            <View style={styles.colPrice}>
                                <Text style={styles.headerText}>{t.colPrice}</Text>
                            </View>
                            <View style={styles.colTotal}>
                                <Text style={styles.headerText}>{t.colTotal}</Text>
                            </View>
                        </View>

                        {/* Table Rows */}
                        {data.items.map((item, index) => {
                            const unitPrice = item.customPrice ?? getBasePrice(getPriceForCurrency(item.service, data.currency));
                            const itemTotal = calculateItemTotal(item);

                            return (
                                <View key={index} style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowAlt] : [])]}>
                                    <View style={styles.colService}>
                                        <Text style={styles.serviceText}>{item.service.name}</Text>
                                        <Text style={styles.serviceDesc}>{item.service.description}</Text>
                                    </View>
                                    <View style={styles.colQty}>
                                        <Text style={styles.serviceText}>{item.quantity}</Text>
                                    </View>
                                    <View style={styles.colPrice}>
                                        <Text style={styles.serviceText}>
                                            {currencySymbol} {unitPrice.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={styles.colTotal}>
                                        <Text style={styles.serviceText}>
                                            {currencySymbol} {itemTotal.toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>{t.subtotal}:</Text>
                        <Text style={styles.totalValue}>
                            {currencySymbol} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                    </View>
                    {data.discount && data.discount > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={[styles.totalLabel, { color: '#64748b' }]}>{t.discount} ({data.discount}%):</Text>
                            <Text style={[styles.totalValue, { color: '#ef4444' }]}>
                                - {currencySymbol} {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                        </View>
                    )}
                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, styles.grandTotal]}>{t.total}:</Text>
                        <Text style={[styles.totalValue, styles.grandTotal]}>
                            {currencySymbol} {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>

                {/* Validity Badge */}
                <Text style={styles.validityBadge}>
                    {t.validUntil}: {data.validUntil}
                </Text>

                {/* Terms */}
                <View style={styles.terms}>
                    <Text style={styles.termsTitle}>{t.termsTitle}</Text>
                    <Text style={styles.termsList}>
                        {data.paymentTerms || t.defaultTerms}
                    </Text>
                </View>

                {/* Notes */}
                {data.notes && (
                    <View style={[styles.section, { marginTop: 15 }]}>
                        <Text style={styles.sectionTitle}>{t.notesTitle}</Text>
                        <Text style={{ fontSize: 9, color: '#64748b', lineHeight: 1.5 }}>
                            {data.notes}
                        </Text>
                    </View>
                )}

                {/* Payment & Bank Details */}
                {data.paymentMethod === 'QR_BILL' && data.qrBillImage ? (
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        paddingHorizontal: 0
                    }} break>
                        {/* Perforated line separator */}
                        <View style={{
                            borderTopWidth: 1,
                            borderTopColor: '#000000',
                            borderStyle: 'dashed',
                            marginBottom: 5,
                            marginHorizontal: 50
                        }} />
                        <Image src={data.qrBillImage} style={{ width: '100%' }} />
                    </View>
                ) : data.paymentMethod === 'BANK_TRANSFER' && data.bankDetails ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payment Information</Text>
                        <View style={{ flexDirection: 'row', marginTop: 5 }}>
                            <View style={{ width: '50%' }}>
                                <Text style={styles.label}>Bank Transfer</Text>
                                <Text style={styles.value}>{data.bankDetails?.bankName}</Text>
                                <Text style={styles.value}>{data.bankDetails?.bankAddress}</Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <Text style={styles.label}>Account Details</Text>
                                <Text style={styles.value}>Holder: {data.bankDetails?.accountHolder}</Text>
                                <Text style={styles.value}>IBAN: {data.bankDetails?.iban}</Text>
                                <Text style={styles.value}>BIC: {data.bankDetails?.bic}</Text>
                            </View>
                        </View>
                    </View>
                ) : null}

                {/* Footer - only show if not QR bill (which has its own footer) */}
                {data.paymentMethod !== 'QR_BILL' && (
                    <Text style={styles.footer}>
                        {t.footer}
                    </Text>
                )}
            </Page>
        </Document >
    );
}
