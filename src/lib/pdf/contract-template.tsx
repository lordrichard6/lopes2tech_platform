'use client';

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';

// Register Inter font
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff2', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff2', fontWeight: 700 },
    ],
});

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 9,
        paddingTop: 40,
        paddingBottom: 60,
        paddingHorizontal: 45,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: '#0891b2',
    },
    logo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    logoAccent: {
        color: '#0891b2',
    },
    headerRight: {
        textAlign: 'right',
    },
    contractTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 3,
    },
    contractNumber: {
        fontSize: 9,
        color: '#64748b',
    },
    partiesSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    partyBox: {
        width: '48%',
        padding: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
    },
    partyLabel: {
        fontSize: 7,
        color: '#64748b',
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    partyName: {
        fontSize: 10,
        color: '#0f172a',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    partyDetail: {
        fontSize: 8,
        color: '#64748b',
    },
    section: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#0891b2',
        marginBottom: 6,
        paddingBottom: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    subsectionTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 3,
        marginTop: 6,
    },
    paragraph: {
        fontSize: 8,
        color: '#374151',
        lineHeight: 1.5,
        marginBottom: 4,
        textAlign: 'justify',
    },
    bulletPoint: {
        fontSize: 8,
        color: '#374151',
        marginLeft: 10,
        marginBottom: 2,
    },
    importantBox: {
        padding: 8,
        backgroundColor: '#fef3c7',
        borderRadius: 4,
        marginTop: 6,
        marginBottom: 6,
    },
    importantText: {
        fontSize: 8,
        color: '#92400e',
        fontWeight: 'bold',
    },
    packageTable: {
        marginTop: 8,
        marginBottom: 8,
    },
    packageRow: {
        flexDirection: 'row',
        padding: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    packageRowSelected: {
        backgroundColor: '#ecfdf5',
        borderWidth: 1,
        borderColor: '#10b981',
        borderRadius: 4,
    },
    packageCheck: {
        width: '8%',
        fontSize: 10,
    },
    packageName: {
        width: '50%',
        fontSize: 8,
        fontWeight: 'bold',
    },
    packagePrice: {
        width: '20%',
        fontSize: 8,
        textAlign: 'right',
        fontWeight: 'bold',
        color: '#0891b2',
    },
    packageDesc: {
        fontSize: 7,
        color: '#64748b',
        marginTop: 2,
    },
    signatureSection: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: '45%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
    },
    signatureLabel: {
        fontSize: 8,
        color: '#64748b',
        marginBottom: 25,
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#0f172a',
        marginBottom: 5,
    },
    signatureText: {
        fontSize: 7,
        color: '#64748b',
    },
    footer: {
        position: 'absolute',
        bottom: 25,
        left: 45,
        right: 45,
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 7,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 8,
    },
    pageNumber: {
        position: 'absolute',
        bottom: 25,
        right: 45,
        fontSize: 8,
        color: '#94a3b8',
    },
});

// =============================================================================
// MULTI-LANGUAGE TRANSLATIONS
// =============================================================================

type Language = 'en' | 'pt' | 'de';

const translations: Record<Language, Record<string, string>> = {
    en: {
        title: 'SERVICE AGREEMENT',
        provider: 'Provider',
        client: 'Client',
        date: 'Date',
        contractNo: 'Contract No.',

        // Section 1
        section1Title: '1. Scope of Services',
        section1_1Title: '1.1 Project Deliverables',
        section1_1Text: 'The Agency agrees to design and build a digital solution based on the package selected below:',
        package1Name: 'Package 1: Digital Business Card',
        package1Desc: 'One-page mobile-first site + WhatsApp Integration + Basic Hosting Setup',
        package2Name: 'Package 2: Google Trust Builder',
        package2Desc: 'Package 1 + Google Business Profile Setup + Review Automation Link',
        package3Name: 'Package 3: Market Leader',
        package3Desc: 'Multi-page structure + Portfolio Gallery + SEO Basics',
        packageCustom: 'Custom Solution',
        packageCustomDesc: 'Scope defined in attached proposal',

        section1_2Title: '1.2 Revisions & Design Process',
        revisionDef: '• A "Revision Round" is a single, consolidated list of changes provided by the Client.',
        revisionLimit: '• This project includes the revision rounds specified in the proposal.',
        revisionScope: '• Changes beyond the agreed scope are billed at CHF 120/hour.',

        // Section 2
        section2Title: '2. Financial Terms',
        section2_1Title: '2.1 Project Fees',
        depositText: '• Deposit: 50% of the project total is due immediately. Work begins only after receipt of funds.',
        finalPaymentText: '• Final Payment: The remaining 50% is due upon completion, before the website goes live.',

        section2_2Title: '2.2 Managed Hosting Service',
        hostingFee: '• Monthly Fee: CHF 39.00/month',
        hostingIncludes: '• Includes: High-speed hosting on Vercel, SSL certificate, domain DNS management, deploy pipeline maintenance, monitoring & alerts, incident response.',
        hostingNonPayment: '• Non-Payment: If the fee is not paid within 30 days, the website will be suspended. After 6 months of non-payment, the website and all associated data will be permanently deleted.',

        // Section 3
        section3Title: '3. Client Obligations',
        section3_1Title: '3.1 Content Responsibility',
        contentText: 'The Client is responsible for providing all text, images, and logos. Voice notes may be used and will be transcribed with AI assistance.',

        section3_2Title: '3.2 Project Dormancy (Anti-Ghosting Protocol)',
        dormancyRule: '• 10-Day Rule: If no feedback is received for 10+ business days, the project goes on "Hold".',
        restartFee: '• Restart Fee: CHF 150 to reactivate a project from Hold status.',
        cancellation: '• Cancellation: After 45 days on Hold, the project is cancelled and the deposit is forfeited.',

        section3_3Title: '3.3 Auto-Approval Clause',
        autoApproval: 'If no feedback is received within 5 business days of a delivery, the work is deemed approved and the Agency will proceed.',

        // Section 4
        section4Title: '4. Technical Standards',
        section4_1Title: '4.1 Browser & Device Support',
        browserSupport: 'The website is guaranteed to function on modern mobile devices (iOS/Android) and browsers (Chrome, Safari, Firefox, Edge). Internet Explorer is not supported.',

        section4_2Title: '4.2 Third-Party Integrations',
        thirdPartyText: 'The Agency connects systems using third-party tools (e.g., WhatsApp API, payment processors). The Agency is not liable for service interruptions caused by changes to these platforms.',

        // Section 5
        section5Title: '5. Intellectual Property',
        clientIP: '• Client IP: The Client owns all text, photos, and customer data provided.',
        agencyIP: '• Agency IP: The Agency retains ownership of code structures, templates, and automation logic.',
        license: '• License: Upon full payment, the Client receives a perpetual, non-transferable license to use the website.',
        portfolioRights: '• Portfolio Rights: The Agency may display the project in marketing materials unless otherwise agreed in writing.',

        // Section 6
        section6Title: '6. Warranty & Support',
        warrantyText: 'The Agency warrants that deliverables will function as described for as long as the monthly hosting fee is paid. This warranty covers bug fixes and technical issues only—not new features or design changes.',
        noGuarantee: 'The Agency does not guarantee any specific business results, traffic, or revenue.',

        // Section 7
        section7Title: '7. Limitation of Liability',
        liabilityText: 'The Agency\'s total liability for any claims shall not exceed the total fees paid by the Client. The Agency is not liable for indirect, incidental, or consequential damages, including lost profits or business interruption.',

        // Section 8
        section8Title: '8. Indemnification',
        indemnifyText: 'The Client agrees to indemnify and hold harmless the Agency from any claims arising from content provided by the Client, including copyright infringement, defamation, or trademark violations.',

        // Section 9
        section9Title: '9. Confidentiality',
        confidentialityText: 'Both parties agree to keep confidential any proprietary information shared during this engagement. This obligation survives termination for 2 years.',

        // Section 10
        section10Title: '10. Data Protection',
        dataProtectionText: 'The Client is solely responsible for GDPR/nFADP compliance regarding their customers\' data. The Agency will assist with technical implementations but is not the data controller.',

        // Section 11
        section11Title: '11. Force Majeure',
        forceMajeureText: 'Neither party shall be liable for delays caused by circumstances beyond their reasonable control, including natural disasters, pandemics, government actions, or infrastructure failures.',

        // Section 12
        section12Title: '12. Communication',
        communicationText: 'The Agency commits to responding to inquiries within 2 business days. Emergency requests (site down) will be addressed within 24 hours during business hours.',

        // Section 13
        section13Title: '13. Term & Termination',
        projectCancel: '• Project Cancellation: The Client may cancel at any time. If cancelled after design has started, the 50% deposit is non-refundable.',
        hostingCancel: '• Hosting Cancellation: Requires 30 days\' written notice.',

        // Section 14
        section14Title: '14. General Provisions',
        amendments: '• Amendments: Any modifications to this Agreement must be made in writing and signed by both parties.',
        entireAgreement: '• Entire Agreement: This document constitutes the entire agreement between the parties.',

        // Section 15
        section15Title: '15. Governing Law',
        jurisdictionText: 'This Agreement is governed by the laws of Switzerland. The place of jurisdiction is the Canton of Zurich.',

        // Signatures
        signaturesTitle: 'Signatures',
        clientSignature: 'Client Signature',
        agencySignature: 'Agency Signature',
        name: 'Name',
        signature: 'Signature',
        dateSigned: 'Date',

        // Footer
        footerText: 'Lopes2Tech • Zurich, Switzerland • www.lopes2tech.ch • paulo@lopes2tech.ch',
    },
    pt: {
        title: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS',
        provider: 'Prestador',
        client: 'Cliente',
        date: 'Data',
        contractNo: 'Contrato Nº',

        // Section 1
        section1Title: '1. Âmbito dos Serviços',
        section1_1Title: '1.1 Entregas do Projeto',
        section1_1Text: 'A Agência compromete-se a desenhar e construir uma solução digital baseada no pacote selecionado abaixo:',
        package1Name: 'Pacote 1: Cartão de Visita Digital',
        package1Desc: 'Site de uma página mobile-first + Integração WhatsApp + Configuração básica de hosting',
        package2Name: 'Pacote 2: Construtor de Confiança Google',
        package2Desc: 'Pacote 1 + Configuração Google Business Profile + Link de Automação de Reviews',
        package3Name: 'Pacote 3: Líder de Mercado',
        package3Desc: 'Estrutura multi-página + Galeria de Portfólio + SEO Básico',
        packageCustom: 'Solução Personalizada',
        packageCustomDesc: 'Âmbito definido na proposta anexa',

        section1_2Title: '1.2 Revisões e Processo de Design',
        revisionDef: '• Uma "Ronda de Revisão" é uma lista única e consolidada de alterações fornecidas pelo Cliente.',
        revisionLimit: '• Este projeto inclui as rondas de revisão especificadas na proposta.',
        revisionScope: '• Alterações fora do âmbito acordado são faturadas a CHF 120/hora.',

        // Section 2
        section2Title: '2. Condições Financeiras',
        section2_1Title: '2.1 Honorários do Projeto',
        depositText: '• Depósito: 50% do total é devido imediatamente. O trabalho inicia apenas após receção dos fundos.',
        finalPaymentText: '• Pagamento Final: Os restantes 50% são devidos na conclusão, antes do site ficar online.',

        section2_2Title: '2.2 Serviço de Hosting Gerido',
        hostingFee: '• Taxa Mensal: CHF 39.00/mês',
        hostingIncludes: '• Inclui: Hosting de alta velocidade no Vercel, certificado SSL, gestão de DNS do domínio, manutenção do pipeline de deploy, monitorização e alertas, resposta a incidentes.',
        hostingNonPayment: '• Não Pagamento: Se a taxa não for paga em 30 dias, o website será suspenso. Após 6 meses sem pagamento, o website e dados associados serão permanentemente eliminados.',

        // Section 3
        section3Title: '3. Obrigações do Cliente',
        section3_1Title: '3.1 Responsabilidade de Conteúdo',
        contentText: 'O Cliente é responsável por fornecer todo o texto, imagens e logótipos. Notas de voz podem ser usadas e serão transcritas com assistência de IA.',

        section3_2Title: '3.2 Dormência do Projeto (Protocolo Anti-Ghosting)',
        dormancyRule: '• Regra dos 10 Dias: Se não houver feedback por 10+ dias úteis, o projeto entra em "Espera".',
        restartFee: '• Taxa de Reativação: CHF 150 para reativar um projeto em Espera.',
        cancellation: '• Cancelamento: Após 45 dias em Espera, o projeto é cancelado e o depósito é perdido.',

        section3_3Title: '3.3 Cláusula de Aprovação Automática',
        autoApproval: 'Se não houver feedback em 5 dias úteis após uma entrega, o trabalho é considerado aprovado e a Agência prossegue.',

        // Section 4
        section4Title: '4. Padrões Técnicos',
        section4_1Title: '4.1 Suporte de Browsers e Dispositivos',
        browserSupport: 'O website é garantido funcionar em dispositivos móveis modernos (iOS/Android) e browsers (Chrome, Safari, Firefox, Edge). Internet Explorer não é suportado.',

        section4_2Title: '4.2 Integrações de Terceiros',
        thirdPartyText: 'A Agência conecta sistemas usando ferramentas de terceiros (ex: WhatsApp API, processadores de pagamento). A Agência não é responsável por interrupções causadas por alterações nestas plataformas.',

        // Section 5
        section5Title: '5. Propriedade Intelectual',
        clientIP: '• PI do Cliente: O Cliente é proprietário de todo texto, fotos e dados de clientes fornecidos.',
        agencyIP: '• PI da Agência: A Agência retém propriedade de estruturas de código, templates e lógica de automação.',
        license: '• Licença: Após pagamento integral, o Cliente recebe licença perpétua e intransferível para usar o website.',
        portfolioRights: '• Direitos de Portfólio: A Agência pode exibir o projeto em materiais de marketing salvo acordo contrário por escrito.',

        // Section 6
        section6Title: '6. Garantia e Suporte',
        warrantyText: 'A Agência garante que as entregas funcionarão conforme descrito enquanto a taxa mensal de hosting for paga. Esta garantia cobre correção de bugs e problemas técnicos—não novas funcionalidades ou alterações de design.',
        noGuarantee: 'A Agência não garante quaisquer resultados de negócio, tráfego ou receita específicos.',

        // Section 7
        section7Title: '7. Limitação de Responsabilidade',
        liabilityText: 'A responsabilidade total da Agência por quaisquer reclamações não excederá o total de honorários pagos pelo Cliente. A Agência não é responsável por danos indiretos, incidentais ou consequenciais, incluindo lucros cessantes ou interrupção de negócio.',

        // Section 8
        section8Title: '8. Indemnização',
        indemnifyText: 'O Cliente concorda em indemnizar e isentar a Agência de quaisquer reclamações decorrentes de conteúdo fornecido pelo Cliente, incluindo violação de direitos de autor, difamação ou violação de marcas.',

        // Section 9
        section9Title: '9. Confidencialidade',
        confidentialityText: 'Ambas as partes concordam em manter confidencial qualquer informação proprietária partilhada durante este compromisso. Esta obrigação sobrevive à rescisão por 2 anos.',

        // Section 10
        section10Title: '10. Proteção de Dados',
        dataProtectionText: 'O Cliente é exclusivamente responsável pela conformidade com RGPD/nFADP relativamente aos dados dos seus clientes. A Agência auxiliará com implementações técnicas mas não é o controlador de dados.',

        // Section 11
        section11Title: '11. Força Maior',
        forceMajeureText: 'Nenhuma parte será responsável por atrasos causados por circunstâncias fora do seu controlo razoável, incluindo desastres naturais, pandemias, ações governamentais ou falhas de infraestrutura.',

        // Section 12
        section12Title: '12. Comunicação',
        communicationText: 'A Agência compromete-se a responder a questões em 2 dias úteis. Pedidos de emergência (site em baixo) serão tratados em 24 horas durante horário de expediente.',

        // Section 13
        section13Title: '13. Prazo e Rescisão',
        projectCancel: '• Cancelamento de Projeto: O Cliente pode cancelar a qualquer momento. Se cancelado após início do design, o depósito de 50% não é reembolsável.',
        hostingCancel: '• Cancelamento de Hosting: Requer 30 dias de aviso prévio por escrito.',

        // Section 14
        section14Title: '14. Disposições Gerais',
        amendments: '• Alterações: Quaisquer modificações a este Contrato devem ser feitas por escrito e assinadas por ambas as partes.',
        entireAgreement: '• Acordo Integral: Este documento constitui o acordo integral entre as partes.',

        // Section 15
        section15Title: '15. Lei Aplicável',
        jurisdictionText: 'Este Contrato é regido pelas leis da Suíça. O foro competente é o Cantão de Zurique.',

        // Signatures
        signaturesTitle: 'Assinaturas',
        clientSignature: 'Assinatura do Cliente',
        agencySignature: 'Assinatura da Agência',
        name: 'Nome',
        signature: 'Assinatura',
        dateSigned: 'Data',

        // Footer
        footerText: 'Lopes2Tech • Zurique, Suíça • www.lopes2tech.ch • paulo@lopes2tech.ch',
    },
    de: {
        title: 'DIENSTLEISTUNGSVERTRAG',
        provider: 'Anbieter',
        client: 'Kunde',
        date: 'Datum',
        contractNo: 'Vertrag Nr.',

        // Section 1
        section1Title: '1. Leistungsumfang',
        section1_1Title: '1.1 Projektleistungen',
        section1_1Text: 'Die Agentur verpflichtet sich, eine digitale Lösung basierend auf dem unten ausgewählten Paket zu entwerfen und zu erstellen:',
        package1Name: 'Paket 1: Digitale Visitenkarte',
        package1Desc: 'Einseitige Mobile-First-Website + WhatsApp-Integration + Basis-Hosting-Setup',
        package2Name: 'Paket 2: Google Trust Builder',
        package2Desc: 'Paket 1 + Google Business Profil Setup + Review-Automatisierung',
        package3Name: 'Paket 3: Marktführer',
        package3Desc: 'Mehrseitige Struktur + Portfolio-Galerie + SEO-Grundlagen',
        packageCustom: 'Individuelle Lösung',
        packageCustomDesc: 'Umfang in beigefügtem Angebot definiert',

        section1_2Title: '1.2 Revisionen & Designprozess',
        revisionDef: '• Eine "Revisionsrunde" ist eine einzelne, konsolidierte Liste von Änderungen des Kunden.',
        revisionLimit: '• Dieses Projekt umfasst die im Angebot angegebenen Revisionsrunden.',
        revisionScope: '• Änderungen ausserhalb des vereinbarten Umfangs werden mit CHF 120/Stunde berechnet.',

        // Section 2
        section2Title: '2. Finanzielle Bedingungen',
        section2_1Title: '2.1 Projekthonorare',
        depositText: '• Anzahlung: 50% der Projektsumme ist sofort fällig. Die Arbeit beginnt erst nach Zahlungseingang.',
        finalPaymentText: '• Schlusszahlung: Die verbleibenden 50% sind bei Fertigstellung fällig, bevor die Website live geht.',

        section2_2Title: '2.2 Managed Hosting Service',
        hostingFee: '• Monatliche Gebühr: CHF 39.00/Monat',
        hostingIncludes: '• Inklusive: Hochgeschwindigkeits-Hosting auf Vercel, SSL-Zertifikat, Domain-DNS-Management, Deploy-Pipeline-Wartung, Monitoring & Alerts, Incident Response.',
        hostingNonPayment: '• Nichtzahlung: Wird die Gebühr nicht innerhalb von 30 Tagen bezahlt, wird die Website suspendiert. Nach 6 Monaten Nichtzahlung werden Website und zugehörige Daten dauerhaft gelöscht.',

        // Section 3
        section3Title: '3. Kundenpflichten',
        section3_1Title: '3.1 Inhaltsverantwortung',
        contentText: 'Der Kunde ist für die Bereitstellung aller Texte, Bilder und Logos verantwortlich. Sprachnotizen können verwendet und werden mit KI-Unterstützung transkribiert.',

        section3_2Title: '3.2 Projektruhe (Anti-Ghosting-Protokoll)',
        dormancyRule: '• 10-Tage-Regel: Erfolgt 10+ Werktage kein Feedback, wird das Projekt auf "Hold" gesetzt.',
        restartFee: '• Reaktivierungsgebühr: CHF 150 zur Reaktivierung eines Projekts aus dem Hold-Status.',
        cancellation: '• Stornierung: Nach 45 Tagen auf Hold wird das Projekt storniert und die Anzahlung verfällt.',

        section3_3Title: '3.3 Auto-Approval-Klausel',
        autoApproval: 'Erfolgt innerhalb von 5 Werktagen nach einer Lieferung kein Feedback, gilt die Arbeit als genehmigt und die Agentur schreitet fort.',

        // Section 4
        section4Title: '4. Technische Standards',
        section4_1Title: '4.1 Browser- & Geräteunterstützung',
        browserSupport: 'Die Website funktioniert garantiert auf modernen Mobilgeräten (iOS/Android) und Browsern (Chrome, Safari, Firefox, Edge). Internet Explorer wird nicht unterstützt.',

        section4_2Title: '4.2 Drittanbieter-Integrationen',
        thirdPartyText: 'Die Agentur verbindet Systeme mit Drittanbieter-Tools (z.B. WhatsApp API, Zahlungsabwickler). Die Agentur haftet nicht für Serviceunterbrechungen durch Änderungen dieser Plattformen.',

        // Section 5
        section5Title: '5. Geistiges Eigentum',
        clientIP: '• Kunden-IP: Der Kunde ist Eigentümer aller bereitgestellten Texte, Fotos und Kundendaten.',
        agencyIP: '• Agentur-IP: Die Agentur behält das Eigentum an Codestrukturen, Templates und Automatisierungslogik.',
        license: '• Lizenz: Nach vollständiger Zahlung erhält der Kunde eine unbefristete, nicht übertragbare Lizenz zur Nutzung der Website.',
        portfolioRights: '• Portfolio-Rechte: Die Agentur darf das Projekt in Marketingmaterialien zeigen, sofern nicht schriftlich anders vereinbart.',

        // Section 6
        section6Title: '6. Garantie & Support',
        warrantyText: 'Die Agentur garantiert, dass Leistungen wie beschrieben funktionieren, solange die monatliche Hosting-Gebühr bezahlt wird. Diese Garantie deckt Fehlerbehebungen und technische Probleme—keine neuen Funktionen oder Designänderungen.',
        noGuarantee: 'Die Agentur garantiert keine spezifischen Geschäftsergebnisse, Traffic oder Umsatz.',

        // Section 7
        section7Title: '7. Haftungsbeschränkung',
        liabilityText: 'Die Gesamthaftung der Agentur für Ansprüche jeglicher Art übersteigt nicht die vom Kunden bezahlten Gesamthonorare. Die Agentur haftet nicht für indirekte, zufällige oder Folgeschäden, einschliesslich entgangenem Gewinn oder Geschäftsunterbrechung.',

        // Section 8
        section8Title: '8. Freistellung',
        indemnifyText: 'Der Kunde stimmt zu, die Agentur von Ansprüchen freizustellen und schadlos zu halten, die aus vom Kunden bereitgestelltem Inhalt entstehen, einschliesslich Urheberrechtsverletzung, Verleumdung oder Markenverletzung.',

        // Section 9
        section9Title: '9. Vertraulichkeit',
        confidentialityText: 'Beide Parteien verpflichten sich, proprietäre Informationen, die während dieses Engagements geteilt werden, vertraulich zu behandeln. Diese Verpflichtung besteht 2 Jahre nach Beendigung fort.',

        // Section 10
        section10Title: '10. Datenschutz',
        dataProtectionText: 'Der Kunde ist allein verantwortlich für die DSGVO/nDSG-Konformität bezüglich der Daten seiner Kunden. Die Agentur unterstützt bei technischen Implementierungen, ist aber nicht Verantwortlicher.',

        // Section 11
        section11Title: '11. Höhere Gewalt',
        forceMajeureText: 'Keine Partei haftet für Verzögerungen durch Umstände ausserhalb ihrer zumutbaren Kontrolle, einschliesslich Naturkatastrophen, Pandemien, Regierungsmassnahmen oder Infrastrukturausfälle.',

        // Section 12
        section12Title: '12. Kommunikation',
        communicationText: 'Die Agentur verpflichtet sich, Anfragen innerhalb von 2 Werktagen zu beantworten. Notfallanfragen (Website down) werden innerhalb von 24 Stunden während der Geschäftszeiten bearbeitet.',

        // Section 13
        section13Title: '13. Laufzeit & Kündigung',
        projectCancel: '• Projektstornierung: Der Kunde kann jederzeit stornieren. Bei Stornierung nach Designbeginn ist die 50%-Anzahlung nicht erstattungsfähig.',
        hostingCancel: '• Hosting-Kündigung: Erfordert 30 Tage schriftliche Kündigungsfrist.',

        // Section 14
        section14Title: '14. Allgemeine Bestimmungen',
        amendments: '• Änderungen: Änderungen dieses Vertrags müssen schriftlich erfolgen und von beiden Parteien unterzeichnet werden.',
        entireAgreement: '• Vollständige Vereinbarung: Dieses Dokument stellt die vollständige Vereinbarung zwischen den Parteien dar.',

        // Section 15
        section15Title: '15. Anwendbares Recht',
        jurisdictionText: 'Dieser Vertrag unterliegt dem Recht der Schweiz. Gerichtsstand ist der Kanton Zürich.',

        // Signatures
        signaturesTitle: 'Unterschriften',
        clientSignature: 'Unterschrift des Kunden',
        agencySignature: 'Unterschrift der Agentur',
        name: 'Name',
        signature: 'Unterschrift',
        dateSigned: 'Datum',

        // Footer
        footerText: 'Lopes2Tech • Zürich, Schweiz • www.lopes2tech.ch • paulo@lopes2tech.ch',
    },
};

// =============================================================================
// DATA TYPES
// =============================================================================

export type PackageType = 'package1' | 'package2' | 'package3' | 'custom';

export interface ContractData {
    contractNumber: string;
    date: string;
    language: Language;
    // Client
    clientName: string;
    clientCompany?: string;
    clientCity: string;
    clientEmail?: string;
    // Package
    selectedPackage: PackageType;
    customPrice?: number;
    customScope?: string;
    // Revisions
    revisionRounds: number;
    // Payment
    projectTotal: number;
    currency: 'CHF' | 'EUR';
    discount?: number;
}

// =============================================================================
// PDF DOCUMENT COMPONENT
// =============================================================================

export function ContractPDFDocument({ data }: { data: ContractData }) {
    const t = translations[data.language];
    const currencySymbol = data.currency === 'CHF' ? 'CHF' : '€';

    return (
        <Document>
            {/* Page 1 */}
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
                        <Text style={styles.contractTitle}>{t.title}</Text>
                        <Text style={styles.contractNumber}>{t.contractNo} {data.contractNumber}</Text>
                        <Text style={{ fontSize: 8, color: '#64748b', marginTop: 3 }}>
                            {t.date}: {data.date}
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
                        <Text style={styles.partyDetail}>{data.clientCity}</Text>
                        {data.clientEmail && (
                            <Text style={styles.partyDetail}>{data.clientEmail}</Text>
                        )}
                    </View>
                </View>

                {/* Section 1: Scope */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.section1Title}</Text>

                    <Text style={styles.subsectionTitle}>{t.section1_1Title}</Text>
                    <Text style={styles.paragraph}>{t.section1_1Text}</Text>

                    <View style={styles.packageTable}>
                        {/* Custom Scope - Always shown */}
                        <View style={[styles.packageRow, styles.packageRowSelected]}>
                            <View style={{ width: '75%' }}>
                                <Text style={styles.packageName}>{t.packageCustom}</Text>
                                <Text style={styles.packageDesc}>{data.customScope || t.packageCustomDesc}</Text>
                            </View>
                            <View style={{ width: '25%', alignItems: 'flex-end' }}>
                                {data.discount ? (
                                    <>
                                        <Text style={{ fontSize: 7, color: '#64748b', marginBottom: 2 }}>{currencySymbol} {data.customPrice?.toLocaleString()}</Text>
                                        <Text style={{ fontSize: 7, color: '#ef4444', marginBottom: 2 }}>-{data.discount}%</Text>
                                        <Text style={styles.packagePrice}>{currencySymbol} {data.projectTotal.toLocaleString()}</Text>
                                    </>
                                ) : (
                                    <Text style={styles.packagePrice}>{currencySymbol} {data.projectTotal.toLocaleString()}</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    <Text style={styles.subsectionTitle}>{t.section1_2Title}</Text>
                    <Text style={styles.bulletPoint}>{t.revisionDef}</Text>
                    <Text style={styles.bulletPoint}>{t.revisionLimit} ({data.revisionRounds} rounds)</Text>
                    <Text style={styles.bulletPoint}>{t.revisionScope}</Text>
                </View>

                {/* Section 2: Financial */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.section2Title}</Text>

                    <Text style={styles.subsectionTitle}>{t.section2_1Title}</Text>
                    <Text style={styles.bulletPoint}>{t.depositText}</Text>
                    <Text style={styles.bulletPoint}>{t.finalPaymentText}</Text>

                    <View style={styles.importantBox}>
                        <Text style={styles.importantText}>
                            Total: {currencySymbol} {data.projectTotal.toLocaleString()} | Deposit: {currencySymbol} {(data.projectTotal / 2).toLocaleString()} | Final: {currencySymbol} {(data.projectTotal / 2).toLocaleString()}
                        </Text>
                    </View>

                    <Text style={styles.subsectionTitle}>{t.section2_2Title}</Text>
                    <Text style={styles.bulletPoint}>{t.hostingFee}</Text>
                    <Text style={styles.bulletPoint}>{t.hostingIncludes}</Text>
                    <Text style={styles.bulletPoint}>{t.hostingNonPayment}</Text>
                </View>

                {/* Section 3: Client Obligations */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.section3Title}</Text>

                    <Text style={styles.subsectionTitle}>{t.section3_1Title}</Text>
                    <Text style={styles.paragraph}>{t.contentText}</Text>

                    <Text style={styles.subsectionTitle}>{t.section3_2Title}</Text>
                    <Text style={styles.bulletPoint}>{t.dormancyRule}</Text>
                    <Text style={styles.bulletPoint}>{t.restartFee}</Text>
                    <Text style={styles.bulletPoint}>{t.cancellation}</Text>

                    <Text style={styles.subsectionTitle}>{t.section3_3Title}</Text>
                    <Text style={styles.paragraph}>{t.autoApproval}</Text>
                </View>

                <Text style={styles.footer}>{t.footerText}</Text>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>

            {/* Page 2 */}
            <Page size="A4" style={styles.page}>
                {/* Section 4: Technical */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.section4Title}</Text>

                    <Text style={styles.subsectionTitle}>{t.section4_1Title}</Text>
                    <Text style={styles.paragraph}>{t.browserSupport}</Text>

                    <Text style={styles.subsectionTitle}>{t.section4_2Title}</Text>
                    <Text style={styles.paragraph}>{t.thirdPartyText}</Text>
                </View>

                {/* Section 5: IP */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.section5Title}</Text>
                    <Text style={styles.bulletPoint}>{t.clientIP}</Text>
                    <Text style={styles.bulletPoint}>{t.agencyIP}</Text>
                    <Text style={styles.bulletPoint}>{t.license}</Text>
                    <Text style={styles.bulletPoint}>{t.portfolioRights}</Text>
                </View>

                {/* Section 6: Warranty */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.section6Title}</Text>
                    <Text style={styles.paragraph}>{t.warrantyText}</Text>
                    <Text style={styles.paragraph}>{t.noGuarantee}</Text>
                </View>

                {/* Section 7: Liability */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.section7Title}</Text>
                    <Text style={styles.paragraph}>{t.liabilityText}</Text>
                </View>

                {/* Section 8: Indemnification */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.section8Title}</Text>
                    <Text style={styles.paragraph}>{t.indemnifyText}</Text>
                </View>

                {/* Section 9: Confidentiality */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.section9Title}</Text>
                    <Text style={styles.paragraph}>{t.confidentialityText}</Text>
                </View>

                {/* Section 10: Data Protection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.section10Title}</Text>
                    <Text style={styles.paragraph}>{t.dataProtectionText}</Text>
                </View>

                {/* Section 11: Force Majeure */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.section11Title}</Text>
                    <Text style={styles.paragraph}>{t.forceMajeureText}</Text>
                </View>

                {/* Section 12: Communication */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.section12Title}</Text>
                    <Text style={styles.paragraph}>{t.communicationText}</Text>
                </View>

                <Text style={styles.footer}>{t.footerText}</Text>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>

            {/* Page 3: Termination, General, Signatures */}
            <Page size="A4" style={styles.page}>
                {/* Section 13: Termination */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.section13Title}</Text>
                    <Text style={styles.bulletPoint}>{t.projectCancel}</Text>
                    <Text style={styles.bulletPoint}>{t.hostingCancel}</Text>
                </View>

                {/* Section 14: General */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.section14Title}</Text>
                    <Text style={styles.bulletPoint}>{t.amendments}</Text>
                    <Text style={styles.bulletPoint}>{t.entireAgreement}</Text>
                </View>

                {/* Section 15: Jurisdiction */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.section15Title}</Text>
                    <Text style={styles.paragraph}>{t.jurisdictionText}</Text>
                </View>

                {/* Signatures */}
                <View style={[styles.section, { marginTop: 30 }]}>
                    <Text style={styles.sectionTitle}>{t.signaturesTitle}</Text>

                    <View style={styles.signatureSection}>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureLabel}>{t.clientSignature}</Text>
                            <View style={styles.signatureLine} />
                            <Text style={styles.signatureText}>{t.name}: {data.clientName}</Text>
                            <View style={[styles.signatureLine, { marginTop: 20 }]} />
                            <Text style={styles.signatureText}>{t.signature}</Text>
                            <View style={[styles.signatureLine, { marginTop: 20 }]} />
                            <Text style={styles.signatureText}>{t.dateSigned}</Text>
                        </View>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureLabel}>{t.agencySignature}</Text>
                            <View style={styles.signatureLine} />
                            <Text style={styles.signatureText}>{t.name}: Paulo Lopes</Text>
                            <View style={[styles.signatureLine, { marginTop: 20 }]} />
                            <Text style={styles.signatureText}>{t.signature}</Text>
                            <View style={[styles.signatureLine, { marginTop: 20 }]} />
                            <Text style={styles.signatureText}>{t.dateSigned}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.footer}>{t.footerText}</Text>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>
        </Document>
    );
}
