import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';

// =============================================================================
// FONTS
// =============================================================================

Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
    ],
});

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Inter',
        fontSize: 9,
        paddingTop: 40,
        paddingBottom: 60,
        paddingHorizontal: 50,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 25,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: '#8b5cf6',
    },
    logo: {
        fontSize: 20,
        fontWeight: 700,
        color: '#1e293b',
    },
    logoAccent: {
        color: '#8b5cf6',
    },
    headerRight: {
        textAlign: 'right',
    },
    docTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: '#8b5cf6',
    },
    docSubtitle: {
        fontSize: 9,
        color: '#64748b',
        marginTop: 3,
    },
    section: {
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 700,
        color: '#1e293b',
        marginBottom: 10,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    partiesSection: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20,
    },
    partyBox: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    partyLabel: {
        fontSize: 7,
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    partyName: {
        fontSize: 11,
        fontWeight: 600,
        color: '#1e293b',
    },
    partyDetail: {
        fontSize: 8,
        color: '#475569',
        marginTop: 2,
    },
    planBox: {
        backgroundColor: '#faf5ff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#8b5cf6',
    },
    planName: {
        fontSize: 14,
        fontWeight: 700,
        color: '#6d28d9',
        marginBottom: 5,
    },
    planPrice: {
        fontSize: 18,
        fontWeight: 700,
        color: '#1e293b',
    },
    planPeriod: {
        fontSize: 9,
        color: '#64748b',
    },
    paragraph: {
        fontSize: 9,
        color: '#475569',
        lineHeight: 1.5,
        marginBottom: 8,
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    bullet: {
        width: 12,
        fontSize: 9,
        color: '#8b5cf6',
    },
    bulletText: {
        flex: 1,
        fontSize: 9,
        color: '#475569',
        lineHeight: 1.4,
    },
    excludedItem: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    excludedBullet: {
        width: 12,
        fontSize: 9,
        color: '#ef4444',
    },
    excludedText: {
        flex: 1,
        fontSize: 9,
        color: '#dc2626',
        lineHeight: 1.4,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingVertical: 8,
    },
    tableLabel: {
        width: '40%',
        fontSize: 9,
        color: '#64748b',
    },
    tableValue: {
        width: '60%',
        fontSize: 9,
        color: '#1e293b',
        fontWeight: 600,
    },
    importantBox: {
        backgroundColor: '#fef3c7',
        borderRadius: 6,
        padding: 12,
        marginTop: 15,
        borderLeftWidth: 3,
        borderLeftColor: '#f59e0b',
    },
    importantTitle: {
        fontSize: 9,
        fontWeight: 600,
        color: '#92400e',
        marginBottom: 4,
    },
    importantText: {
        fontSize: 8,
        color: '#78350f',
        lineHeight: 1.4,
    },
    signatureSection: {
        flexDirection: 'row',
        marginTop: 30,
        gap: 30,
    },
    signatureBox: {
        flex: 1,
    },
    signatureLabel: {
        fontSize: 8,
        color: '#64748b',
        marginBottom: 25,
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        marginBottom: 5,
    },
    signatureText: {
        fontSize: 8,
        color: '#64748b',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        textAlign: 'center',
        fontSize: 7,
        color: '#94a3b8',
    },
    pageNumber: {
        position: 'absolute',
        bottom: 30,
        right: 50,
        fontSize: 8,
        color: '#94a3b8',
    },
});

// =============================================================================
// TRANSLATIONS
// =============================================================================

type Language = 'en' | 'pt' | 'de';

interface SupportTranslations {
    title: string;
    subtitle: string;
    agreementNo: string;
    effectiveDate: string;
    provider: string;
    client: string;
    planTitle: string;
    perMonth: string;
    includedTitle: string;
    included1: string;
    included2: string;
    included3: string;
    included4: string;
    included5: string;
    included6: string;
    excludedTitle: string;
    excluded1: string;
    excluded2: string;
    excluded3: string;
    excluded4: string;
    termsTitle: string;
    termLabel: string;
    termValue: string;
    billingLabel: string;
    billingValue: string;
    paymentLabel: string;
    paymentValue: string;
    startLabel: string;
    cancellationTitle: string;
    cancellationText: string;
    nonPaymentTitle: string;
    nonPaymentText: string;
    slaTitle: string;
    slaItem1: string;
    slaItem2: string;
    slaItem3: string;
    acceptanceTitle: string;
    acceptanceText: string;
    clientSignature: string;
    agencySignature: string;
    dateLabel: string;
    footerText: string;
}

const translations: Record<Language, SupportTranslations> = {
    en: {
        title: 'Support Agreement',
        subtitle: 'Monthly Maintenance & Hosting',
        agreementNo: 'Agreement No.',
        effectiveDate: 'Effective Date',
        provider: 'Service Provider',
        client: 'Client',
        planTitle: 'Managed Hosting Plan',
        perMonth: '/month',
        includedTitle: 'Included Services',
        included1: 'High-performance Vercel hosting',
        included2: 'SSL certificate management',
        included3: 'Domain DNS configuration',
        included4: 'Deploy pipeline maintenance',
        included5: '24/7 uptime monitoring and alerts',
        included6: 'Incident response and bug fixes',
        excludedTitle: 'Not Included',
        excluded1: 'New feature development',
        excluded2: 'Design changes or redesigns',
        excluded3: 'Content updates (text, images)',
        excluded4: 'Third-party integration changes',
        termsTitle: 'Agreement Terms',
        termLabel: 'Term',
        termValue: 'Month-to-month, auto-renewing',
        billingLabel: 'Billing Cycle',
        billingValue: 'Monthly, in advance',
        paymentLabel: 'Payment Method',
        paymentValue: 'Stripe automatic payment',
        startLabel: 'Start Date',
        cancellationTitle: 'Cancellation',
        cancellationText: 'Either party may cancel with 30 days written notice. There are no refunds for partial months.',
        nonPaymentTitle: 'Non-Payment Policy',
        nonPaymentText: 'If payment is not received within 30 days, the website will be suspended. After 6 months of non-payment, the website and all associated data will be permanently deleted.',
        slaTitle: 'Service Level Agreement',
        slaItem1: 'Response time: 2 business days for general inquiries',
        slaItem2: 'Emergency response: 24 hours for critical issues (site down)',
        slaItem3: 'Uptime target: 99.9% (excluding scheduled maintenance)',
        acceptanceTitle: 'Agreement',
        acceptanceText: 'By signing below, both parties agree to the terms outlined in this Support Agreement.',
        clientSignature: 'Client Signature',
        agencySignature: 'Agency Signature',
        dateLabel: 'Date',
        footerText: 'Lopes2Tech • Zurich, Switzerland • www.lopes2tech.ch • paulo@lopes2tech.ch',
    },
    pt: {
        title: 'Contrato de Suporte',
        subtitle: 'Manutencao e Hosting Mensal',
        agreementNo: 'Contrato No.',
        effectiveDate: 'Data de Inicio',
        provider: 'Prestador de Servicos',
        client: 'Cliente',
        planTitle: 'Plano de Hosting Gerido',
        perMonth: '/mes',
        includedTitle: 'Servicos Incluidos',
        included1: 'Hosting de alto desempenho Vercel',
        included2: 'Gestao de certificado SSL',
        included3: 'Configuracao DNS do dominio',
        included4: 'Manutencao do pipeline de deploy',
        included5: 'Monitorizacao 24/7 e alertas',
        included6: 'Resposta a incidentes e correcao de bugs',
        excludedTitle: 'Nao Incluido',
        excluded1: 'Desenvolvimento de novas funcionalidades',
        excluded2: 'Alteracoes de design ou redesign',
        excluded3: 'Atualizacoes de conteudo (texto, imagens)',
        excluded4: 'Alteracoes em integracoes de terceiros',
        termsTitle: 'Termos do Contrato',
        termLabel: 'Duracao',
        termValue: 'Mensal, renovacao automatica',
        billingLabel: 'Ciclo de Faturacao',
        billingValue: 'Mensal, antecipado',
        paymentLabel: 'Metodo de Pagamento',
        paymentValue: 'Pagamento automatico Stripe',
        startLabel: 'Data de Inicio',
        cancellationTitle: 'Cancelamento',
        cancellationText: 'Qualquer das partes pode cancelar com 30 dias de aviso previo por escrito. Nao ha reembolso por meses parciais.',
        nonPaymentTitle: 'Politica de Nao Pagamento',
        nonPaymentText: 'Se o pagamento nao for recebido em 30 dias, o website sera suspenso. Apos 6 meses sem pagamento, o website e todos os dados associados serao permanentemente eliminados.',
        slaTitle: 'Acordo de Nivel de Servico',
        slaItem1: 'Tempo de resposta: 2 dias uteis para questoes gerais',
        slaItem2: 'Resposta de emergencia: 24 horas para problemas criticos',
        slaItem3: 'Meta de uptime: 99.9% (excluindo manutencao programada)',
        acceptanceTitle: 'Acordo',
        acceptanceText: 'Ao assinar abaixo, ambas as partes concordam com os termos descritos neste Contrato de Suporte.',
        clientSignature: 'Assinatura do Cliente',
        agencySignature: 'Assinatura da Agencia',
        dateLabel: 'Data',
        footerText: 'Lopes2Tech • Zurique, Suica • www.lopes2tech.ch • paulo@lopes2tech.ch',
    },
    de: {
        title: 'Support-Vereinbarung',
        subtitle: 'Monatliche Wartung und Hosting',
        agreementNo: 'Vereinbarung Nr.',
        effectiveDate: 'Gueltig ab',
        provider: 'Dienstleister',
        client: 'Kunde',
        planTitle: 'Managed Hosting Plan',
        perMonth: '/Monat',
        includedTitle: 'Enthaltene Leistungen',
        included1: 'Hochleistungs-Vercel-Hosting',
        included2: 'SSL-Zertifikatsverwaltung',
        included3: 'Domain-DNS-Konfiguration',
        included4: 'Deploy-Pipeline-Wartung',
        included5: '24/7 Uptime-Ueberwachung und Alerts',
        included6: 'Incident Response und Fehlerbehebung',
        excludedTitle: 'Nicht enthalten',
        excluded1: 'Neue Funktionsentwicklung',
        excluded2: 'Designaenderungen oder Redesigns',
        excluded3: 'Inhaltsaktualisierungen (Text, Bilder)',
        excluded4: 'Aenderungen an Drittanbieter-Integrationen',
        termsTitle: 'Vertragsbedingungen',
        termLabel: 'Laufzeit',
        termValue: 'Monatlich, automatische Verlaengerung',
        billingLabel: 'Abrechnungszyklus',
        billingValue: 'Monatlich, im Voraus',
        paymentLabel: 'Zahlungsmethode',
        paymentValue: 'Automatische Stripe-Zahlung',
        startLabel: 'Startdatum',
        cancellationTitle: 'Kuendigung',
        cancellationText: 'Jede Partei kann mit 30 Tagen schriftlicher Kuendigungsfrist kuendigen. Es gibt keine Rueckerstattung fuer angebrochene Monate.',
        nonPaymentTitle: 'Nichtzahlungsrichtlinie',
        nonPaymentText: 'Wird die Zahlung nicht innerhalb von 30 Tagen erhalten, wird die Website suspendiert. Nach 6 Monaten Nichtzahlung werden die Website und alle zugehoerigen Daten dauerhaft geloescht.',
        slaTitle: 'Service Level Agreement',
        slaItem1: 'Antwortzeit: 2 Werktage fuer allgemeine Anfragen',
        slaItem2: 'Notfall-Reaktion: 24 Stunden fuer kritische Probleme',
        slaItem3: 'Uptime-Ziel: 99.9% (ohne geplante Wartung)',
        acceptanceTitle: 'Vereinbarung',
        acceptanceText: 'Mit der Unterschrift stimmen beide Parteien den in dieser Support-Vereinbarung beschriebenen Bedingungen zu.',
        clientSignature: 'Unterschrift Kunde',
        agencySignature: 'Unterschrift Agentur',
        dateLabel: 'Datum',
        footerText: 'Lopes2Tech • Zuerich, Schweiz • www.lopes2tech.ch • paulo@lopes2tech.ch',
    },
};

// =============================================================================
// DATA TYPES
// =============================================================================

export interface SupportAgreementData {
    language: Language;
    agreementNumber: string;
    date: string;
    startDate: string;
    // Client
    clientName: string;
    clientCompany?: string;
    clientEmail?: string;
    // Plan
    monthlyFee: number;
    currency: 'CHF' | 'EUR';
}

// =============================================================================
// PDF DOCUMENT COMPONENT
// =============================================================================

export function SupportAgreementPDFDocument({ data }: { data: SupportAgreementData }) {
    const t = translations[data.language];
    const currencySymbol = data.currency === 'CHF' ? 'CHF' : 'EUR';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.logo}>
                            Lopes<Text style={styles.logoAccent}>2</Text>Tech
                        </Text>
                        <Text style={{ fontSize: 7, color: '#64748b', marginTop: 2 }}>
                            Web Development & Digital Solutions
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.docTitle}>{t.title}</Text>
                        <Text style={styles.docSubtitle}>{t.subtitle}</Text>
                        <Text style={{ fontSize: 8, color: '#64748b', marginTop: 5 }}>
                            {t.agreementNo} {data.agreementNumber}
                        </Text>
                    </View>
                </View>

                {/* Parties */}
                <View style={styles.partiesSection}>
                    <View style={styles.partyBox}>
                        <Text style={styles.partyLabel}>{t.provider}</Text>
                        <Text style={styles.partyName}>Lopes2Tech</Text>
                        <Text style={styles.partyDetail}>Paulo Lopes</Text>
                        <Text style={styles.partyDetail}>Zurich, Switzerland</Text>
                        <Text style={styles.partyDetail}>paulo@lopes2tech.ch</Text>
                    </View>
                    <View style={styles.partyBox}>
                        <Text style={styles.partyLabel}>{t.client}</Text>
                        <Text style={styles.partyName}>{data.clientName}</Text>
                        {data.clientCompany && (
                            <Text style={styles.partyDetail}>{data.clientCompany}</Text>
                        )}
                        {data.clientEmail && (
                            <Text style={styles.partyDetail}>{data.clientEmail}</Text>
                        )}
                    </View>
                </View>

                {/* Plan Box */}
                <View style={styles.planBox}>
                    <Text style={styles.planName}>{t.planTitle}</Text>
                    <Text style={styles.planPrice}>
                        {currencySymbol} {data.monthlyFee}
                        <Text style={styles.planPeriod}>{t.perMonth}</Text>
                    </Text>
                </View>

                {/* Included Services */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.includedTitle}</Text>
                    <View style={styles.bulletItem}>
                        <Text style={styles.bullet}>+</Text>
                        <Text style={styles.bulletText}>{t.included1}</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Text style={styles.bullet}>+</Text>
                        <Text style={styles.bulletText}>{t.included2}</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Text style={styles.bullet}>+</Text>
                        <Text style={styles.bulletText}>{t.included3}</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Text style={styles.bullet}>+</Text>
                        <Text style={styles.bulletText}>{t.included4}</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Text style={styles.bullet}>+</Text>
                        <Text style={styles.bulletText}>{t.included5}</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Text style={styles.bullet}>+</Text>
                        <Text style={styles.bulletText}>{t.included6}</Text>
                    </View>
                </View>

                {/* Excluded Services */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.excludedTitle}</Text>
                    <View style={styles.excludedItem}>
                        <Text style={styles.excludedBullet}>-</Text>
                        <Text style={styles.excludedText}>{t.excluded1}</Text>
                    </View>
                    <View style={styles.excludedItem}>
                        <Text style={styles.excludedBullet}>-</Text>
                        <Text style={styles.excludedText}>{t.excluded2}</Text>
                    </View>
                    <View style={styles.excludedItem}>
                        <Text style={styles.excludedBullet}>-</Text>
                        <Text style={styles.excludedText}>{t.excluded3}</Text>
                    </View>
                    <View style={styles.excludedItem}>
                        <Text style={styles.excludedBullet}>-</Text>
                        <Text style={styles.excludedText}>{t.excluded4}</Text>
                    </View>
                </View>

                {/* Terms */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.termsTitle}</Text>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableLabel}>{t.termLabel}</Text>
                        <Text style={styles.tableValue}>{t.termValue}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableLabel}>{t.billingLabel}</Text>
                        <Text style={styles.tableValue}>{t.billingValue}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableLabel}>{t.paymentLabel}</Text>
                        <Text style={styles.tableValue}>{t.paymentValue}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableLabel}>{t.startLabel}</Text>
                        <Text style={styles.tableValue}>{data.startDate}</Text>
                    </View>
                </View>

                <Text style={styles.footer}>{t.footerText}</Text>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>

            {/* Page 2 */}
            <Page size="A4" style={styles.page}>
                {/* SLA */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.slaTitle}</Text>
                    <View style={styles.bulletItem}>
                        <Text style={styles.bullet}>*</Text>
                        <Text style={styles.bulletText}>{t.slaItem1}</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Text style={styles.bullet}>*</Text>
                        <Text style={styles.bulletText}>{t.slaItem2}</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Text style={styles.bullet}>*</Text>
                        <Text style={styles.bulletText}>{t.slaItem3}</Text>
                    </View>
                </View>

                {/* Cancellation */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.cancellationTitle}</Text>
                    <Text style={styles.paragraph}>{t.cancellationText}</Text>
                </View>

                {/* Non-Payment */}
                <View style={styles.importantBox}>
                    <Text style={styles.importantTitle}>{t.nonPaymentTitle}</Text>
                    <Text style={styles.importantText}>{t.nonPaymentText}</Text>
                </View>

                {/* Acceptance */}
                <View style={[styles.section, { marginTop: 25 }]}>
                    <Text style={styles.sectionTitle}>{t.acceptanceTitle}</Text>
                    <Text style={styles.paragraph}>{t.acceptanceText}</Text>
                </View>

                {/* Signatures */}
                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>{t.clientSignature}</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureText}>{data.clientName}</Text>
                        <View style={[styles.signatureLine, { marginTop: 20 }]} />
                        <Text style={styles.signatureText}>{t.dateLabel}</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>{t.agencySignature}</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureText}>Paulo Lopes - Lopes2Tech</Text>
                        <View style={[styles.signatureLine, { marginTop: 20 }]} />
                        <Text style={styles.signatureText}>{t.dateLabel}</Text>
                    </View>
                </View>

                <Text style={styles.footer}>{t.footerText}</Text>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>
        </Document>
    );
}
