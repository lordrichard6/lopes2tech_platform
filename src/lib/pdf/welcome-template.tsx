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

// Font registration removed to use standard Helvetica and avoid 404 errors
// Font.register({ ... });

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
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
        marginBottom: 30,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: '#10b981',
    },
    logo: {
        fontSize: 20,
        fontWeight: 700,
        color: '#1e293b',
    },
    logoAccent: {
        color: '#10b981',
    },
    headerRight: {
        textAlign: 'right',
    },
    welcomeTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: '#10b981',
    },
    welcomeSubtitle: {
        fontSize: 9,
        color: '#64748b',
        marginTop: 3,
    },
    heroSection: {
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
        padding: 25,
        marginBottom: 25,
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
    },
    heroTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: '#166534',
        marginBottom: 8,
    },
    heroText: {
        fontSize: 10,
        color: '#15803d',
        lineHeight: 1.6,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: '#1e293b',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    infoBox: {
        width: '48%',
        backgroundColor: '#f8fafc',
        borderRadius: 6,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    infoLabel: {
        fontSize: 8,
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    infoValue: {
        fontSize: 10,
        fontWeight: 600,
        color: '#1e293b',
    },
    paragraph: {
        fontSize: 9,
        color: '#475569',
        lineHeight: 1.6,
        marginBottom: 8,
    },
    bulletList: {
        marginTop: 5,
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    bullet: {
        width: 15,
        fontSize: 9,
        color: '#10b981',
    },
    bulletText: {
        flex: 1,
        fontSize: 9,
        color: '#475569',
        lineHeight: 1.5,
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fafafa',
        borderRadius: 4,
    },
    checkbox: {
        width: 14,
        height: 14,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 3,
        marginRight: 10,
    },
    checklistText: {
        flex: 1,
        fontSize: 9,
        color: '#334155',
    },
    contactCard: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        padding: 15,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 10,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 11,
        fontWeight: 600,
        color: '#1e293b',
    },
    contactRole: {
        fontSize: 8,
        color: '#64748b',
        marginTop: 2,
    },
    contactDetails: {
        marginTop: 8,
    },
    contactDetail: {
        fontSize: 9,
        color: '#475569',
        marginBottom: 3,
    },
    timelineContainer: {
        marginTop: 10,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#10b981',
        marginRight: 10,
        marginTop: 3,
    },
    timelineContent: {
        flex: 1,
    },
    timelinePhase: {
        fontSize: 10,
        fontWeight: 600,
        color: '#1e293b',
    },
    timelineDesc: {
        fontSize: 8,
        color: '#64748b',
        marginTop: 2,
    },
    importantBox: {
        backgroundColor: '#fef9c3',
        borderRadius: 6,
        padding: 12,
        marginTop: 15,
        borderLeftWidth: 3,
        borderLeftColor: '#eab308',
    },
    importantTitle: {
        fontSize: 9,
        fontWeight: 600,
        color: '#854d0e',
        marginBottom: 4,
    },
    importantText: {
        fontSize: 8,
        color: '#713f12',
        lineHeight: 1.5,
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

interface WelcomeTranslations {
    // Header
    title: string;
    subtitle: string;
    // Hero
    heroTitle: string;
    heroText: string;
    // Portal Access
    portalTitle: string;
    portalUrl: string;
    portalEmail: string;
    // portalPassword removed
    portalNote: string;
    // Timeline
    timelineTitle: string;
    phase1: string;
    phase1Desc: string;
    phase2: string;
    phase2Desc: string;
    phase3: string;
    phase3Desc: string;
    phase4: string;
    phase4Desc: string;
    // Contact
    contactTitle: string;
    contactRole: string;
    contactEmail: string;
    contactPhone: string;
    contactResponse: string;
    // Communication
    commTitle: string;
    commIntro: string;
    commItem1: string;
    commItem2: string;
    commItem3: string;
    commItem4: string;
    // Next Steps
    nextStepsTitle: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
    // Important
    importantTitle: string;
    importantText: string;
    // Footer
    footerText: string;
}

const translations: Record<Language, WelcomeTranslations> = {
    en: {
        title: 'Onboarding Guide',
        subtitle: 'Your guide to getting started',
        heroTitle: 'Welcome to Lopes2Tech!',
        heroText: 'We\'re thrilled to have you on board! This document contains everything you need to know to get started with your project. Keep it handy as a reference throughout our collaboration.',
        portalTitle: 'Your Client Portal',
        portalUrl: 'Portal URL',
        portalEmail: 'Login Email',
        // portalPassword removed
        portalNote: 'Change your password after first login. You can access invoices, documents, and project updates through the portal.',
        timelineTitle: 'Project Timeline Overview',
        phase1: 'Discovery & Planning',
        phase1Desc: 'Initial consultation, requirements gathering, project scope definition',
        phase2: 'Design & Development',
        phase2Desc: 'Visual design, development, content integration',
        phase3: 'Review & Refinement',
        phase3Desc: 'Your feedback rounds, adjustments, final polish',
        phase4: 'Launch & Handover',
        phase4Desc: 'Go-live, training, documentation delivery',
        contactTitle: 'Your Point of Contact',
        contactRole: 'Project Lead',
        contactEmail: 'Email',
        contactPhone: 'Phone/WhatsApp',
        contactResponse: 'Response time: 2 business days (24h for emergencies)',
        commTitle: 'Communication Guidelines',
        commIntro: 'To ensure smooth collaboration:',
        commItem1: 'All project communication via email or the client portal',
        commItem2: 'Consolidate feedback into a single message when possible',
        commItem3: 'Response to deliveries within 5 business days',
        commItem4: 'WhatsApp for urgent matters only',
        nextStepsTitle: 'Next Steps Checklist',
        step1: 'Log into your client portal and update your password',
        step2: 'Schedule the kickoff call (link will be sent separately)',
        step3: 'Gather brand assets (logo, colors, fonts) if available',
        step4: 'Prepare content (text, images) for your website',
        step5: 'Review the project timeline and note key dates',
        importantTitle: 'Quick Reminder',
        importantText: 'Remember: We work on a 50% deposit structure. The initial invoice is included with this package. Work begins once the deposit is received.',
        footerText: 'Lopes2Tech • Zurich, Switzerland • www.lopes2tech.ch • paulo@lopes2tech.ch',
    },
    pt: {
        title: 'Guia de Onboarding',
        subtitle: 'O seu guia para começar',
        heroTitle: 'Bem-vindo a Lopes2Tech!',
        heroText: 'Estamos muito felizes por tê-lo connosco! Este documento contém tudo o que precisa saber para começar o seu projeto. Guarde-o como referência ao longo da nossa colaboração.',
        portalTitle: 'O Seu Portal de Cliente',
        portalUrl: 'URL do Portal',
        portalEmail: 'Email de Acesso',
        // portalPassword removed
        portalNote: 'Altere a sua palavra-passe após o primeiro login. Pode aceder a faturas, documentos e atualizações do projeto através do portal.',
        timelineTitle: 'Visão Geral do Cronograma',
        phase1: 'Descoberta & Planeamento',
        phase1Desc: 'Consulta inicial, levantamento de requisitos, definição do âmbito',
        phase2: 'Design & Desenvolvimento',
        phase2Desc: 'Design visual, desenvolvimento, integração de conteúdo',
        phase3: 'Revisão & Refinamento',
        phase3Desc: 'Rondas de feedback, ajustes, polimento final',
        phase4: 'Lançamento & Entrega',
        phase4Desc: 'Go-live, formação, entrega de documentação',
        contactTitle: 'O Seu Ponto de Contacto',
        contactRole: 'Responsável do Projeto',
        contactEmail: 'Email',
        contactPhone: 'Telefone/WhatsApp',
        contactResponse: 'Tempo de resposta: 2 dias úteis (24h para emergências)',
        commTitle: 'Diretrizes de Comunicação',
        commIntro: 'Para garantir uma colaboração fluida:',
        commItem1: 'Toda a comunicação do projeto por email ou portal',
        commItem2: 'Consolide o feedback numa única mensagem quando possível',
        commItem3: 'Responda às entregas em até 5 dias úteis',
        commItem4: 'WhatsApp apenas para assuntos urgentes',
        nextStepsTitle: 'Próximos Passos',
        step1: 'Aceda ao portal e atualize a sua palavra-passe',
        step2: 'Agende a chamada de kickoff (link enviado separadamente)',
        step3: 'Reúna os assets da marca (logo, cores, fontes) se disponíveis',
        step4: 'Prepare o conteúdo (texto, imagens) para o website',
        step5: 'Reveja o cronograma e anote as datas importantes',
        importantTitle: 'Lembrete Rapido',
        importantText: 'Lembre-se: Trabalhamos com estrutura de 50% de depósito. A fatura inicial está incluída neste pacote. O trabalho começa após receção do depósito.',
        footerText: 'Lopes2Tech • Zurique, Suíça • www.lopes2tech.ch • paulo@lopes2tech.ch',
    },
    de: {
        title: 'Onboarding-Guide',
        subtitle: 'Ihr Leitfaden für den Start',
        heroTitle: 'Willkommen bei Lopes2Tech!',
        heroText: 'Wir freuen uns sehr, Sie an Bord zu haben! Dieses Dokument enthält alles, was Sie wissen müssen, um mit Ihrem Projekt zu beginnen. Bewahren Sie es als Referenz während unserer Zusammenarbeit auf.',
        portalTitle: 'Ihr Kundenportal',
        portalUrl: 'Portal-URL',
        portalEmail: 'Login-E-Mail',
        // portalPassword removed
        portalNote: 'Ändern Sie Ihr Passwort nach dem ersten Login. Sie können über das Portal auf Rechnungen, Dokumente und Projekt-Updates zugreifen.',
        timelineTitle: 'Projektzeitplan Übersicht',
        phase1: 'Entdeckung & Planung',
        phase1Desc: 'Erstberatung, Anforderungsaufnahme, Projektumfang definieren',
        phase2: 'Design & Entwicklung',
        phase2Desc: 'Visuelles Design, Entwicklung, Content-Integration',
        phase3: 'Review & Verfeinerung',
        phase3Desc: 'Ihre Feedback-Runden, Anpassungen, Feinschliff',
        phase4: 'Launch & Übergabe',
        phase4Desc: 'Go-Live, Schulung, Dokumentationsübergabe',
        contactTitle: 'Ihr Ansprechpartner',
        contactRole: 'Projektleiter',
        contactEmail: 'E-Mail',
        contactPhone: 'Telefon/WhatsApp',
        contactResponse: 'Antwortzeit: 2 Werktage (24h für Notfälle)',
        commTitle: 'Kommunikationsrichtlinien',
        commIntro: 'Für eine reibungslose Zusammenarbeit:',
        commItem1: 'Projektkommunikation per E-Mail oder Kundenportal',
        commItem2: 'Feedback in einer Nachricht bündeln wenn möglich',
        commItem3: 'Antwort auf Lieferungen innerhalb von 5 Werktagen',
        commItem4: 'WhatsApp nur für dringende Angelegenheiten',
        nextStepsTitle: 'Nächste Schritte Checkliste',
        step1: 'Im Kundenportal einloggen und Passwort ändern',
        step2: 'Kickoff-Gespräch vereinbaren (Link wird separat gesendet)',
        step3: 'Marken-Assets sammeln (Logo, Farben, Schriften) falls vorhanden',
        step4: 'Inhalte vorbereiten (Text, Bilder) für Ihre Website',
        step5: 'Zeitplan prüfen und wichtige Termine notieren',
        importantTitle: 'Schnelle Erinnerung',
        importantText: 'Hinweis: Wir arbeiten mit 50% Anzahlung. Die erste Rechnung ist in diesem Paket enthalten. Die Arbeit beginnt nach Erhalt der Anzahlung.',
        footerText: 'Lopes2Tech • Zürich, Schweiz • www.lopes2tech.ch • paulo@lopes2tech.ch',
    },
};

// =============================================================================
// DATA TYPES
// =============================================================================

export interface WelcomeData {
    language: Language;
    date: string;
    // Client
    clientName: string;
    clientCompany?: string;
    clientEmail: string;
    // Portal
    portalUrl: string;
    // portalPassword removed
    // Project
    projectName: string;
    estimatedTimeline?: string;
    kickoffDate?: string;
}

// =============================================================================
// PDF DOCUMENT COMPONENT
// =============================================================================

export function WelcomePDFDocument({ data }: { data: WelcomeData }) {
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
                        <Text style={styles.welcomeTitle}>{t.title}</Text>
                        <Text style={styles.welcomeSubtitle}>{t.subtitle}</Text>
                        <Text style={{ fontSize: 8, color: '#64748b', marginTop: 5 }}>
                            {data.date}
                        </Text>
                    </View>
                </View>

                {/* Hero Welcome Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>{t.heroTitle}</Text>
                    <Text style={styles.heroText}>{t.heroText}</Text>
                </View>

                {/* Client Info */}
                <View style={styles.section}>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Client</Text>
                            <Text style={styles.infoValue}>{data.clientName}</Text>
                            {data.clientCompany && (
                                <Text style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>{data.clientCompany}</Text>
                            )}
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Project</Text>
                            <Text style={styles.infoValue}>{data.projectName}</Text>
                            {data.estimatedTimeline && (
                                <Text style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>{data.estimatedTimeline}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Portal Access */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.portalTitle}</Text>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>{t.portalUrl}</Text>
                            <Text style={styles.infoValue}>{data.portalUrl}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>{t.portalEmail}</Text>
                            <Text style={styles.infoValue}>{data.clientEmail}</Text>
                        </View>
                    </View>
                    <Text style={[styles.paragraph, { marginTop: 10, color: '#64748b' }]}>{t.portalNote}</Text>
                </View>

                {/* Project Timeline */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.timelineTitle}</Text>
                    <View style={styles.timelineContainer}>
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineDot} />
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelinePhase}>1. {t.phase1}</Text>
                                <Text style={styles.timelineDesc}>{t.phase1Desc}</Text>
                            </View>
                        </View>
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineDot} />
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelinePhase}>2. {t.phase2}</Text>
                                <Text style={styles.timelineDesc}>{t.phase2Desc}</Text>
                            </View>
                        </View>
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineDot} />
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelinePhase}>3. {t.phase3}</Text>
                                <Text style={styles.timelineDesc}>{t.phase3Desc}</Text>
                            </View>
                        </View>
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineDot} />
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelinePhase}>4. {t.phase4}</Text>
                                <Text style={styles.timelineDesc}>{t.phase4Desc}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <Text style={styles.footer}>{t.footerText}</Text>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>

            {/* Page 2 */}
            <Page size="A4" style={styles.page}>
                {/* Contact */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.contactTitle}</Text>
                    <View style={styles.contactCard}>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactName}>Paulo Lopes</Text>
                            <Text style={styles.contactRole}>{t.contactRole}</Text>
                            <View style={styles.contactDetails}>
                                <Text style={styles.contactDetail}>{t.contactEmail}: paulo@lopes2tech.ch</Text>
                                <Text style={styles.contactDetail}>{t.contactPhone}: +41 78 798 95 33</Text>
                                <Text style={[styles.contactDetail, { marginTop: 5, color: '#64748b' }]}>{t.contactResponse}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Communication Guidelines */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.commTitle}</Text>
                    <Text style={styles.paragraph}>{t.commIntro}</Text>
                    <View style={styles.bulletList}>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>{t.commItem1}</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>{t.commItem2}</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>{t.commItem3}</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>{t.commItem4}</Text>
                        </View>
                    </View>
                </View>

                {/* Next Steps Checklist */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.nextStepsTitle}</Text>
                    <View style={styles.checklistItem}>
                        <View style={styles.checkbox} />
                        <Text style={styles.checklistText}>{t.step1}</Text>
                    </View>
                    <View style={styles.checklistItem}>
                        <View style={styles.checkbox} />
                        <Text style={styles.checklistText}>{t.step2}</Text>
                    </View>
                    <View style={styles.checklistItem}>
                        <View style={styles.checkbox} />
                        <Text style={styles.checklistText}>{t.step3}</Text>
                    </View>
                    <View style={styles.checklistItem}>
                        <View style={styles.checkbox} />
                        <Text style={styles.checklistText}>{t.step4}</Text>
                    </View>
                    <View style={styles.checklistItem}>
                        <View style={styles.checkbox} />
                        <Text style={styles.checklistText}>{t.step5}</Text>
                    </View>
                </View>

                {/* Important Reminder */}
                <View style={styles.importantBox}>
                    <Text style={styles.importantTitle}>{t.importantTitle}</Text>
                    <Text style={styles.importantText}>{t.importantText}</Text>
                </View>

                <Text style={styles.footer}>{t.footerText}</Text>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>
        </Document>
    );
}
