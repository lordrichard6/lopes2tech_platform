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
        borderBottomColor: '#3b82f6',
    },
    logo: {
        fontSize: 20,
        fontWeight: 700,
        color: '#1e293b',
    },
    logoAccent: {
        color: '#3b82f6',
    },
    headerRight: {
        textAlign: 'right',
    },
    docTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: '#3b82f6',
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
    summaryBox: {
        backgroundColor: '#eff6ff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6',
    },
    summaryTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: '#1e40af',
        marginBottom: 6,
    },
    summaryText: {
        fontSize: 9,
        color: '#1e40af',
        lineHeight: 1.5,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 15,
    },
    infoBox: {
        width: '48%',
        backgroundColor: '#f8fafc',
        borderRadius: 6,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    infoLabel: {
        fontSize: 7,
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 9,
        fontWeight: 600,
        color: '#1e293b',
    },
    deliverableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    deliverableCheck: {
        width: 16,
        fontSize: 10,
        color: '#22c55e',
    },
    deliverableName: {
        flex: 1,
        fontSize: 9,
        color: '#334155',
    },
    deliverableStatus: {
        fontSize: 8,
        fontWeight: 600,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusComplete: {
        backgroundColor: '#dcfce7',
        color: '#166534',
    },
    statusPending: {
        backgroundColor: '#fef9c3',
        color: '#854d0e',
    },
    credentialBox: {
        backgroundColor: '#fafafa',
        borderRadius: 6,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    credentialTitle: {
        fontSize: 9,
        fontWeight: 600,
        color: '#1e293b',
        marginBottom: 6,
    },
    credentialRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    credentialLabel: {
        width: 70,
        fontSize: 8,
        color: '#64748b',
    },
    credentialValue: {
        flex: 1,
        fontSize: 8,
        color: '#334155',
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
        color: '#3b82f6',
    },
    bulletText: {
        flex: 1,
        fontSize: 9,
        color: '#475569',
        lineHeight: 1.4,
    },
    warningBox: {
        backgroundColor: '#fef3c7',
        borderRadius: 6,
        padding: 12,
        marginTop: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#f59e0b',
    },
    warningTitle: {
        fontSize: 9,
        fontWeight: 600,
        color: '#92400e',
        marginBottom: 4,
    },
    warningText: {
        fontSize: 8,
        color: '#78350f',
        lineHeight: 1.4,
    },
    successBox: {
        backgroundColor: '#dcfce7',
        borderRadius: 6,
        padding: 12,
        marginTop: 15,
        borderLeftWidth: 3,
        borderLeftColor: '#22c55e',
    },
    successTitle: {
        fontSize: 9,
        fontWeight: 600,
        color: '#166534',
        marginBottom: 4,
    },
    successText: {
        fontSize: 8,
        color: '#15803d',
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

interface HandoverTranslations {
    title: string;
    subtitle: string;
    summaryTitle: string;
    summaryText: string;
    projectInfoTitle: string;
    clientLabel: string;
    projectLabel: string;
    completedLabel: string;
    durationLabel: string;
    deliverablesTitle: string;
    complete: string;
    pending: string;
    credentialsTitle: string;
    credentialsNote: string;
    urlLabel: string;
    emailLabel: string;
    passwordLabel: string;
    adminLabel: string;
    hostingLabel: string;
    documentationTitle: string;
    docItem1: string;
    docItem2: string;
    docItem3: string;
    limitationsTitle: string;
    warrantyTitle: string;
    warrantyText: string;
    nextStepsTitle: string;
    nextStep1: string;
    nextStep2: string;
    nextStep3: string;
    acceptanceTitle: string;
    acceptanceText: string;
    clientSignature: string;
    agencySignature: string;
    dateLabel: string;
    footerText: string;
}

const translations: Record<Language, HandoverTranslations> = {
    en: {
        title: 'Project Handover',
        subtitle: 'Delivery & Acceptance Document',
        summaryTitle: 'Project Successfully Completed',
        summaryText: 'This document confirms the successful completion and delivery of your project. Please review the deliverables and sign to acknowledge acceptance.',
        projectInfoTitle: 'Project Information',
        clientLabel: 'Client',
        projectLabel: 'Project',
        completedLabel: 'Completed',
        durationLabel: 'Duration',
        deliverablesTitle: 'Deliverables Checklist',
        complete: 'Complete',
        pending: 'Pending',
        credentialsTitle: 'Access Credentials',
        credentialsNote: 'Important: Change all passwords after first login. Store credentials securely.',
        urlLabel: 'URL',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        adminLabel: 'Admin Panel',
        hostingLabel: 'Hosting',
        documentationTitle: 'Documentation & Resources',
        docItem1: 'User guide and content management instructions sent via email',
        docItem2: 'Source code available in your client portal',
        docItem3: 'Video walkthrough of admin features (if applicable)',
        limitationsTitle: 'Known Limitations & Notes',
        warrantyTitle: 'Warranty & Support',
        warrantyText: 'Your project is covered by our continuous warranty as long as the monthly hosting fee (CHF 39/month) is paid. This covers bug fixes and technical issues. New features or design changes are billable separately.',
        nextStepsTitle: 'Next Steps',
        nextStep1: 'Review the website and ensure everything works as expected',
        nextStep2: 'Provide feedback within 5 business days for any final adjustments',
        nextStep3: 'Set up monthly hosting payment to maintain warranty',
        acceptanceTitle: 'Acceptance',
        acceptanceText: 'By signing below, the client acknowledges receipt of the deliverables listed above and confirms they meet the agreed specifications.',
        clientSignature: 'Client Signature',
        agencySignature: 'Agency Signature',
        dateLabel: 'Date',
        footerText: 'Lopes2Tech • Zurich, Switzerland • www.lopes2tech.ch • paulo@lopes2tech.ch',
    },
    pt: {
        title: 'Entrega do Projeto',
        subtitle: 'Documento de Entrega e Aceitacao',
        summaryTitle: 'Projeto Concluido com Sucesso',
        summaryText: 'Este documento confirma a conclusao e entrega bem-sucedida do seu projeto. Por favor, reveja os entregaveis e assine para confirmar a aceitacao.',
        projectInfoTitle: 'Informacao do Projeto',
        clientLabel: 'Cliente',
        projectLabel: 'Projeto',
        completedLabel: 'Concluido',
        durationLabel: 'Duracao',
        deliverablesTitle: 'Lista de Entregaveis',
        complete: 'Completo',
        pending: 'Pendente',
        credentialsTitle: 'Credenciais de Acesso',
        credentialsNote: 'Importante: Altere todas as passwords apos o primeiro login. Guarde as credenciais em seguranca.',
        urlLabel: 'URL',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        adminLabel: 'Painel Admin',
        hostingLabel: 'Hosting',
        documentationTitle: 'Documentacao e Recursos',
        docItem1: 'Guia do utilizador e instrucoes de gestao de conteudo enviados por email',
        docItem2: 'Codigo fonte disponivel no seu portal de cliente',
        docItem3: 'Video explicativo das funcionalidades admin (se aplicavel)',
        limitationsTitle: 'Limitacoes Conhecidas e Notas',
        warrantyTitle: 'Garantia e Suporte',
        warrantyText: 'O seu projeto esta coberto pela nossa garantia continua enquanto a taxa mensal de hosting (CHF 39/mes) for paga. Isto cobre correcao de bugs e problemas tecnicos. Novas funcionalidades ou alteracoes de design sao faturadas separadamente.',
        nextStepsTitle: 'Proximos Passos',
        nextStep1: 'Reveja o website e garanta que tudo funciona como esperado',
        nextStep2: 'Forneca feedback em ate 5 dias uteis para ajustes finais',
        nextStep3: 'Configure o pagamento mensal de hosting para manter a garantia',
        acceptanceTitle: 'Aceitacao',
        acceptanceText: 'Ao assinar abaixo, o cliente confirma a rececao dos entregaveis listados acima e confirma que cumprem as especificacoes acordadas.',
        clientSignature: 'Assinatura do Cliente',
        agencySignature: 'Assinatura da Agencia',
        dateLabel: 'Data',
        footerText: 'Lopes2Tech • Zurique, Suica • www.lopes2tech.ch • paulo@lopes2tech.ch',
    },
    de: {
        title: 'Projektuebergabe',
        subtitle: 'Liefer- und Abnahmedokument',
        summaryTitle: 'Projekt erfolgreich abgeschlossen',
        summaryText: 'Dieses Dokument bestaetigt den erfolgreichen Abschluss und die Lieferung Ihres Projekts. Bitte ueberpruefen Sie die Lieferungen und unterschreiben Sie zur Bestaetigung.',
        projectInfoTitle: 'Projektinformationen',
        clientLabel: 'Kunde',
        projectLabel: 'Projekt',
        completedLabel: 'Abgeschlossen',
        durationLabel: 'Dauer',
        deliverablesTitle: 'Lieferungen Checkliste',
        complete: 'Fertig',
        pending: 'Ausstehend',
        credentialsTitle: 'Zugangsdaten',
        credentialsNote: 'Wichtig: Aendern Sie alle Passwoerter nach dem ersten Login. Bewahren Sie die Zugangsdaten sicher auf.',
        urlLabel: 'URL',
        emailLabel: 'E-Mail',
        passwordLabel: 'Passwort',
        adminLabel: 'Admin-Bereich',
        hostingLabel: 'Hosting',
        documentationTitle: 'Dokumentation und Ressourcen',
        docItem1: 'Benutzerhandbuch und Content-Management-Anleitungen per E-Mail gesendet',
        docItem2: 'Quellcode im Kundenportal verfuegbar',
        docItem3: 'Video-Walkthrough der Admin-Funktionen (falls zutreffend)',
        limitationsTitle: 'Bekannte Einschraenkungen und Hinweise',
        warrantyTitle: 'Garantie und Support',
        warrantyText: 'Ihr Projekt ist durch unsere fortlaufende Garantie abgedeckt, solange die monatliche Hosting-Gebuehr (CHF 39/Monat) bezahlt wird. Dies deckt Fehlerbehebungen und technische Probleme ab. Neue Funktionen oder Designaenderungen werden separat berechnet.',
        nextStepsTitle: 'Naechste Schritte',
        nextStep1: 'Ueberpruefen Sie die Website und stellen Sie sicher, dass alles wie erwartet funktioniert',
        nextStep2: 'Geben Sie innerhalb von 5 Werktagen Feedback fuer letzte Anpassungen',
        nextStep3: 'Richten Sie die monatliche Hosting-Zahlung ein, um die Garantie aufrechtzuerhalten',
        acceptanceTitle: 'Abnahme',
        acceptanceText: 'Mit der Unterschrift bestaetigt der Kunde den Erhalt der oben aufgefuehrten Lieferungen und bestaetigt, dass sie den vereinbarten Spezifikationen entsprechen.',
        clientSignature: 'Unterschrift Kunde',
        agencySignature: 'Unterschrift Agentur',
        dateLabel: 'Datum',
        footerText: 'Lopes2Tech • Zuerich, Schweiz • www.lopes2tech.ch • paulo@lopes2tech.ch',
    },
};

// =============================================================================
// DATA TYPES
// =============================================================================

export interface Deliverable {
    name: string;
    complete: boolean;
}

export interface Credential {
    service: string;
    url?: string;
    email?: string;
    password?: string;
    notes?: string;
}

export interface HandoverData {
    language: Language;
    documentNumber: string;
    date: string;
    // Client
    clientName: string;
    clientCompany?: string;
    // Project
    projectName: string;
    projectDuration?: string;
    // Deliverables
    deliverables: Deliverable[];
    // Credentials
    credentials: Credential[];
    // Limitations
    limitations?: string[];
    // Website URL
    websiteUrl: string;
}

// =============================================================================
// PDF DOCUMENT COMPONENT
// =============================================================================

export function HandoverPDFDocument({ data }: { data: HandoverData }) {
    const t = translations[data.language];

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
                            #{data.documentNumber} | {data.date}
                        </Text>
                    </View>
                </View>

                {/* Summary Box */}
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryTitle}>{t.summaryTitle}</Text>
                    <Text style={styles.summaryText}>{t.summaryText}</Text>
                </View>

                {/* Project Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.projectInfoTitle}</Text>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>{t.clientLabel}</Text>
                            <Text style={styles.infoValue}>{data.clientName}</Text>
                            {data.clientCompany && (
                                <Text style={{ fontSize: 8, color: '#64748b' }}>{data.clientCompany}</Text>
                            )}
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>{t.projectLabel}</Text>
                            <Text style={styles.infoValue}>{data.projectName}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>{t.completedLabel}</Text>
                            <Text style={styles.infoValue}>{data.date}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Website</Text>
                            <Text style={styles.infoValue}>{data.websiteUrl}</Text>
                        </View>
                    </View>
                </View>

                {/* Deliverables */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.deliverablesTitle}</Text>
                    {data.deliverables.map((item, index) => (
                        <View key={index} style={styles.deliverableRow}>
                            <Text style={styles.deliverableCheck}>{item.complete ? '[x]' : '[ ]'}</Text>
                            <Text style={styles.deliverableName}>{item.name}</Text>
                            <Text style={[styles.deliverableStatus, item.complete ? styles.statusComplete : styles.statusPending]}>
                                {item.complete ? t.complete : t.pending}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Credentials */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.credentialsTitle}</Text>
                    {data.credentials.map((cred, index) => (
                        <View key={index} style={styles.credentialBox}>
                            <Text style={styles.credentialTitle}>{cred.service}</Text>
                            {cred.url && (
                                <View style={styles.credentialRow}>
                                    <Text style={styles.credentialLabel}>{t.urlLabel}:</Text>
                                    <Text style={styles.credentialValue}>{cred.url}</Text>
                                </View>
                            )}
                            {cred.email && (
                                <View style={styles.credentialRow}>
                                    <Text style={styles.credentialLabel}>{t.emailLabel}:</Text>
                                    <Text style={styles.credentialValue}>{cred.email}</Text>
                                </View>
                            )}
                            {cred.password && (
                                <View style={styles.credentialRow}>
                                    <Text style={styles.credentialLabel}>{t.passwordLabel}:</Text>
                                    <Text style={styles.credentialValue}>{cred.password}</Text>
                                </View>
                            )}
                            {cred.notes && (
                                <Text style={{ fontSize: 7, color: '#64748b', marginTop: 4 }}>{cred.notes}</Text>
                            )}
                        </View>
                    ))}
                    <View style={styles.warningBox}>
                        <Text style={styles.warningTitle}>Important</Text>
                        <Text style={styles.warningText}>{t.credentialsNote}</Text>
                    </View>
                </View>

                <Text style={styles.footer}>{t.footerText}</Text>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>

            {/* Page 2 */}
            <Page size="A4" style={styles.page}>
                {/* Documentation */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.documentationTitle}</Text>
                    <View style={styles.bulletItem}>
                        <Text style={styles.bullet}>*</Text>
                        <Text style={styles.bulletText}>{t.docItem1}</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Text style={styles.bullet}>*</Text>
                        <Text style={styles.bulletText}>{t.docItem2}</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Text style={styles.bullet}>*</Text>
                        <Text style={styles.bulletText}>{t.docItem3}</Text>
                    </View>
                </View>

                {/* Limitations */}
                {data.limitations && data.limitations.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t.limitationsTitle}</Text>
                        {data.limitations.map((limitation, index) => (
                            <View key={index} style={styles.bulletItem}>
                                <Text style={styles.bullet}>*</Text>
                                <Text style={styles.bulletText}>{limitation}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Warranty */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.warrantyTitle}</Text>
                    <Text style={styles.paragraph}>{t.warrantyText}</Text>
                </View>

                {/* Next Steps */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.nextStepsTitle}</Text>
                    <View style={styles.bulletItem}>
                        <Text style={styles.bullet}>1.</Text>
                        <Text style={styles.bulletText}>{t.nextStep1}</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Text style={styles.bullet}>2.</Text>
                        <Text style={styles.bulletText}>{t.nextStep2}</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Text style={styles.bullet}>3.</Text>
                        <Text style={styles.bulletText}>{t.nextStep3}</Text>
                    </View>
                </View>

                {/* Acceptance */}
                <View style={styles.successBox}>
                    <Text style={styles.successTitle}>{t.acceptanceTitle}</Text>
                    <Text style={styles.successText}>{t.acceptanceText}</Text>
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
