import * as fs from 'fs';

const csvPath = '/Users/paulolopes/Downloads/services_export_2026-01-22.csv';
const fileContent = fs.readFileSync(csvPath, 'utf-8');

// Translation Dictionary (Key = Full English Name found in file)
const translations: Record<string, {
    en: string, pt: string, de: string,
    desc_en: string, desc_pt: string, desc_de: string
}> = {
    // Ads
    'Ads: One-Time Setup': {
        en: 'Ads: One-Time Setup', pt: 'Ads: Setup Único', de: 'Ads: Einmaliges Setup',
        desc_en: 'Account setup and campaign creation without monthly management',
        desc_pt: 'Configuração de conta e campanhas sem gestão mensal',
        desc_de: 'Kontoeinrichtung und Kampagnenerstellung ohne monatliche Verwaltung'
    },
    'Ads: Visibility Max': {
        en: 'Ads: Visibility Max', pt: 'Ads: Visibilidade Max', de: 'Ads: Sichtbarkeit Max',
        desc_en: 'Google Ads management up to CHF 1000 spend',
        desc_pt: 'Gestão Google Ads até CHF 1000 spend',
        desc_de: 'Google Ads Management bis CHF 1000 Budget'
    },
    'Ads: Visibility Pro': {
        en: 'Ads: Visibility Pro', pt: 'Ads: Visibilidade Pro', de: 'Ads: Sichtbarkeit Pro',
        desc_en: 'Google Ads management up to CHF 600 spend',
        desc_pt: 'Gestão Google Ads até CHF 600 spend',
        desc_de: 'Google Ads Management bis CHF 600 Budget'
    },
    'Ads: Visibility Starter': {
        en: 'Ads: Visibility Starter', pt: 'Ads: Visibilidade Starter', de: 'Ads: Sichtbarkeit Starter',
        desc_en: 'Google Ads management up to CHF 300 spend',
        desc_pt: 'Gestão Google Ads até CHF 300 spend',
        desc_de: 'Google Ads Management bis CHF 300 Budget'
    },

    // AI
    'AI: RAG Knowledge Base': {
        en: 'AI: RAG Knowledge Base', pt: 'AI: Base de Conhecimento RAG', de: 'AI: RAG Wissensdatenbank',
        desc_en: 'Intelligent search across company documents',
        desc_pt: 'Pesquisa inteligente em documentos da empresa',
        desc_de: 'Intelligente Suche in Unternehmensdokumenten'
    },
    'AI: FAQ Chatbot': {
        en: 'AI: FAQ Chatbot', pt: 'AI: Chatbot FAQ', de: 'AI: FAQ Chatbot',
        desc_en: 'Trained widget, automated answers, human handoff',
        desc_pt: 'Widget treinado, respostas automáticas, handoff humano',
        desc_de: 'Trainiertes Widget, automatische Antworten, Mensch-Übergabe'
    },
    'AI: AI Support Flow': {
        en: 'AI: AI Support Flow', pt: 'AI: Fluxo de Suporte IA', de: 'AI: AI Support-Workflow',
        desc_en: 'Automated triage, hybrid answers, dashboard',
        desc_pt: 'Triagem automática, respostas híbridas, dashboard',
        desc_de: 'Automatische Triage, hybride Antworten, Dashboard'
    },

    // Auto
    'Auto: Appointments': {
        en: 'Auto: Appointments', pt: 'Auto: Agendamentos', de: 'Auto: Terminbuchung',
        desc_en: 'Calendly/Cal.com integration, Google Calendar sync',
        desc_pt: 'Integração Calendly/Cal.com, sync Google Calendar',
        desc_de: 'Calendly/Cal.com Integration, Google Calendar Sync'
    },
    'Auto: Lead Capture': {
        en: 'Auto: Lead Capture', pt: 'Auto: Captação de Leads', de: 'Auto: Lead-Erfassung',
        desc_en: 'CRM form, Welcome Email, Team notifications',
        desc_pt: 'Formulário CRM, Welcome Email, Notificações equipa',
        desc_de: 'CRM-Formular, Willkommens-E-Mail, Team-Benachrichtigungen'
    },
    'Auto: Review Collection': {
        en: 'Auto: Review Collection', pt: 'Auto: Coleção de Reviews', de: 'Auto: Bewertungs-Sammlung',
        desc_en: 'Email sequence, Google Reviews link',
        desc_pt: 'Sequência de emails, link Google Reviews',
        desc_de: 'E-Mail-Sequenz, Google Reviews Link'
    },
    'Auto: Micro Form': {
        en: 'Auto: Micro Form', pt: 'Auto: Formulário Micro', de: 'Auto: Mikro-Formular',
        desc_en: 'Form with automated notifications',
        desc_pt: 'Formulário com notificações automáticas',
        desc_de: 'Formular mit automatischen Benachrichtigungen'
    },
    'Auto: Custom Integration': {
        en: 'Auto: Custom Integration', pt: 'Auto: Integração Custom', de: 'Auto: Benutzerdefinierte Integration',
        desc_en: 'n8n workflows, payments, complex API connections',
        desc_pt: 'n8n workflows, pagamentos, conexões API complexas',
        desc_de: 'n8n Workflows, Zahlungen, komplexe API-Verbindungen'
    },

    // Branding
    'Branding: Brand Kit': {
        en: 'Branding: Brand Kit', pt: 'Branding: Kit de Marca', de: 'Branding: Marken-Kit',
        desc_en: 'Logo, colors, typography, brand guide, social kit',
        desc_pt: 'Logo, cores, tipografia, guia de marca, social kit',
        desc_de: 'Logo, Farben, Typografie, Brand Guide, Social Kit'
    },
    'Branding: Simple Logo': {
        en: 'Branding: Simple Logo', pt: 'Branding: Logótipo Simples', de: 'Branding: Einfaches Logo',
        desc_en: '3 concepts, 2 revisions, final files',
        desc_pt: '3 conceitos, 2 revisões, ficheiros finais',
        desc_de: '3 Konzepte, 2 Überarbeitungen, finale Dateien'
    },
    'Branding: Full Rebrand': {
        en: 'Branding: Full Rebrand', pt: 'Branding: Rebrand Completo', de: 'Branding: Komplettes Rebranding',
        desc_en: 'Complete kit + strategy, analysis, templates',
        desc_pt: 'Kit completo + estratégia, análise, templates',
        desc_de: 'Komplettes Kit + Strategie, Analyse, Vorlagen'
    },

    // Bundle
    'Bundle: Growth Success': {
        en: 'Bundle: Growth Success', pt: 'Bundle: Sucesso Growth', de: 'Bundle: Wachstumserfolg',
        desc_en: 'Growth Care + 6h retainer',
        desc_pt: 'Growth Care + 6h retainer',
        desc_de: 'Growth Care + 6 Std Retainer'
    },
    'Bundle: Scale Success': {
        en: 'Bundle: Scale Success', pt: 'Bundle: Sucesso Scale', de: 'Bundle: Skalierungserfolg',
        desc_en: 'Growth Care + 12h retainer + Priority',
        desc_pt: 'Growth Care + 12h retainer + Priority',
        desc_de: 'Growth Care + 12 Std Retainer + Priorität'
    },
    'Bundle: Starter Success': {
        en: 'Bundle: Starter Success', pt: 'Bundle: Sucesso Starter', de: 'Bundle: Start-Erfolg',
        desc_en: 'Essential Care + 3h retainer',
        desc_pt: 'Essential Care + 3h retainer',
        desc_de: 'Essential Care + 3 Std Retainer'
    },

    // Care
    'Care: Essential (Yearly)': {
        en: 'Care: Essential (Yearly)', pt: 'Care: Essencial (Anual)', de: 'Care: Essential (Jährlich)',
        desc_en: 'Hosting + Weekly updates, 1h support, Priority',
        desc_pt: 'Hosting + Updates semanais, 1h suporte, Prioritário',
        desc_de: 'Hosting + Wöchentliche Updates, 1 Std Support, Priorität'
    },
    'Care: Essential (Monthly)': {
        en: 'Care: Essential (Monthly)', pt: 'Care: Essencial (Mensal)', de: 'Care: Essential (Monatlich)',
        desc_en: 'Hosting + Weekly updates, 1h support, Priority',
        desc_pt: 'Hosting + Updates semanais, 1h suporte, Prioritário',
        desc_de: 'Hosting + Wöchentliche Updates, 1 Std Support, Priorität'
    },
    'Care: Growth (Yearly)': {
        en: 'Care: Growth (Yearly)', pt: 'Care: Crescimento (Anual)', de: 'Care: Wachstum (Jährlich)',
        desc_en: 'Essential + SEO Report, 2h support, Monthly consulting',
        desc_pt: 'Essential + Relatório SEO, 2h suporte, Consultoria mensal',
        desc_de: 'Essential + SEO-Bericht, 2 Std Support, Monatliche Beratung'
    },
    'Care: Growth (Monthly)': {
        en: 'Care: Growth (Monthly)', pt: 'Care: Crescimento (Mensal)', de: 'Care: Wachstum (Monatlich)',
        desc_en: 'Essential + SEO Report, 2h support, Monthly consulting',
        desc_pt: 'Essential + Relatório SEO, 2h suporte, Consultoria mensal',
        desc_de: 'Essential + SEO-Bericht, 2 Std Support, Monatliche Beratung'
    },

    // Hosting
    'Hosting: Yearly': {
        en: 'Hosting: Yearly', pt: 'Hosting: Anual', de: 'Hosting: Jährlich',
        desc_en: 'Hosting, SSL, Backups, 24/7 Monitoring (2 months free)',
        desc_pt: 'Hosting, SSL, Backups, Monitorização 24/7 (2 meses grátis)',
        desc_de: 'Hosting, SSL, Backups, 24/7 Monitoring (2 Monate gratis)'
    },
    'Hosting: Monthly': {
        en: 'Hosting: Monthly', pt: 'Hosting: Mensal', de: 'Hosting: Monatlich',
        desc_en: 'Hosting, SSL, Backups, 24/7 Monitoring',
        desc_pt: 'Hosting, SSL, Backups, Monitorização 24/7',
        desc_de: 'Hosting, SSL, Backups, 24/7 Monitoring'
    },
    'Hosting: Setup + Domain': {
        en: 'Hosting: Setup + Domain', pt: 'Hosting: Configuração + Domínio', de: 'Hosting: Einrichtung + Domain',
        desc_en: 'Domain setup and hosting (Vercel/Railway)',
        desc_pt: 'Setup de domínio e hosting Vercel/Railway',
        desc_de: 'Domain-Einrichtung und Hosting (Vercel/Railway)'
    },
    'Hosting: Migration': {
        en: 'Hosting: Migration', pt: 'Hosting: Migração', de: 'Hosting: Migration',
        desc_en: 'Migration from existing host',
        desc_pt: 'Migração de host existente',
        desc_de: 'Migration von bestehendem Host'
    },

    // Leads
    'Leads: Growth': {
        en: 'Leads: Growth', pt: 'Leads: Crescimento', de: 'Leads: Wachstum',
        desc_en: 'Starter + Email nurturing + Monthly review',
        desc_pt: 'Starter + Email nurturing + Review mensal',
        desc_de: 'Starter + E-Mail-Nurturing + Monatliche Überprüfung'
    },
    'Leads: Magnet Setup': {
        en: 'Leads: Magnet Setup', pt: 'Leads: Configuração de Magnet', de: 'Leads: Magnet-Einrichtung',
        desc_en: 'PDF creation + One-shot Landing page',
        desc_pt: 'Criação de PDF + Landing page one-shot',
        desc_de: 'PDF-Erstellung + One-Shot Landing Page'
    },
    'Leads: Pro': {
        en: 'Leads: Pro', pt: 'Leads: Pro', de: 'Leads: Pro',
        desc_en: 'Growth + A/B testing + Retargeting',
        desc_pt: 'Growth + A/B testing + Retargeting',
        desc_de: 'Growth + A/B-Testing + Retargeting'
    },
    'Leads: Starter': {
        en: 'Leads: Starter', pt: 'Leads: Starter', de: 'Leads: Starter',
        desc_en: 'Landing page, form, notifications',
        desc_pt: 'Landing page, form, notifications',
        desc_de: 'Landing Page, Formular, Benachrichtigungen'
    },

    // Quick
    'Quick: Website Audit': {
        en: 'Quick: Website Audit', pt: 'Quick: Auditoria Website', de: 'Quick: Website-Audit',
        desc_en: 'UX/UI/SEO Analysis, PDF with improvements',
        desc_pt: 'Análise UX/UI/SEO, PDF com melhorias',
        desc_de: 'UX/UI/SEO-Analyse, PDF mit Verbesserungen'
    },
    'Quick: Google Business': {
        en: 'Quick: Google Business', pt: 'Quick: Google Business', de: 'Quick: Google Business',
        desc_en: 'Profile optimization, initial posts',
        desc_pt: 'Otimização perfil, posts iniciais',
        desc_de: 'Profiloptimierung, erste Beiträge'
    },
    'Quick: Speed Optimization': {
        en: 'Quick: Speed Optimization', pt: 'Quick: Otimização de Velocidade', de: 'Quick: Geschwindigkeitsoptimierung',
        desc_en: 'Cache, images, minified code',
        desc_pt: 'Cache, imagens, código minificado',
        desc_de: 'Cache, Bilder, minifizierter Code'
    },

    // Retainer
    'Retainer: Enterprise (20h)': {
        en: 'Retainer: Enterprise (20h)', pt: 'Retainer: Enterprise (20h)', de: 'Retainer: Enterprise (20 Std)',
        desc_en: 'Monthly hours bank (CHF 95/h)',
        desc_pt: 'Banco de horas mensal (CHF 95/h)',
        desc_de: 'Monatliches Stundenbank (CHF 95/Std)'
    },
    'Retainer: Lite (6h)': {
        en: 'Retainer: Lite (6h)', pt: 'Retainer: Lite (6h)', de: 'Retainer: Lite (6 Std)',
        desc_en: 'Monthly hours bank (CHF 105/h)',
        desc_pt: 'Banco de horas mensal (CHF 105/h)',
        desc_de: 'Monatliches Stundenbank (CHF 105/Std)'
    },
    'Retainer: Pro (12h)': {
        en: 'Retainer: Pro (12h)', pt: 'Retainer: Pro (12h)', de: 'Retainer: Pro (12 Std)',
        desc_en: 'Monthly hours bank (CHF 100/h)',
        desc_pt: 'Banco de horas mensal (CHF 100/h)',
        desc_de: 'Monatliches Stundenbank (CHF 100/Std)'
    },

    // WebApp
    'WebApp: Custom App': {
        en: 'WebApp: Custom App', pt: 'WebApp: App Personalizada', de: 'WebApp: Individuelle App',
        desc_en: 'Tailored development, Stripe, Users, API',
        desc_pt: 'Desenvolvimento à medida, Stripe, Users, API',
        desc_de: 'Maßgeschneiderte Entwicklung, Stripe, Benutzer, API'
    },
    'WebApp: Internal Dashboard': {
        en: 'WebApp: Internal Dashboard', pt: 'WebApp: Dashboard Interno', de: 'WebApp: Internes Dashboard',
        desc_en: 'KPIs, charts, data export, filters',
        desc_pt: 'KPIs, gráficos, exportação dados, filtros',
        desc_de: 'KPIs, Diagramme, Datenexport, Filter'
    },
    'WebApp: Client Portal': {
        en: 'WebApp: Client Portal', pt: 'WebApp: Portal de Cliente', de: 'WebApp: Kundenportal',
        desc_en: 'Secure login, documents, status, communication',
        desc_pt: 'Login seguro, documentos, status, comunicação',
        desc_de: 'Sicheres Login, Dokumente, Status, Kommunikation'
    },

    // Website
    'Website: Business Pro': {
        en: 'Website: Business Pro', pt: 'Website: Business Pro', de: 'Website: Business Pro',
        desc_en: '3-5 pages, advanced SEO, basic CRM, Reports',
        desc_pt: '3-5 páginas, SEO avançado, CRM básico, Relatórios',
        desc_de: '3-5 Seiten, fortgeschrittenes SEO, Basis-CRM, Berichte'
    },
    'Website: Landing Page': {
        en: 'Website: Landing Page', pt: 'Website: Landing Page', de: 'Website: Landing Page',
        desc_en: 'A fast, professional one-page website designed to convert visitors into leads. Includes responsive layout, modern section structure, and contact form.',
        desc_pt: 'Um site profissional de uma página projetado para converter visitantes em leads. Inclui layout responsivo, estrutura moderna e formulário de contato.',
        desc_de: 'Eine schnelle, professionelle One-Page-Website, die Besucher in Leads umwandeln soll. Inklusive responsivem Layout und Kontaktformular.'
    },
    'Website: Multi-Page 6+': {
        en: 'Website: Multi-Page 6+', pt: 'Website: Multi-Page 6+', de: 'Website: Multi-Page 6+',
        desc_en: '6+ pages, custom features, complex SEO',
        desc_pt: '6+ páginas, custom features, complex SEO',
        desc_de: '6+ Seiten, benutzerdefinierte Funktionen, komplexes SEO'
    },
    'Website: Starter Plus': {
        en: 'Website: Starter Plus', pt: 'Website: Starter Plus', de: 'Website: Starter Plus',
        desc_en: 'Starter + Logo, Branding Kit, Social Kit',
        desc_pt: 'Starter + Logótipo, Branding Kit, Social Kit',
        desc_de: 'Starter + Logo, Branding Kit, Social Kit'
    },
    'Website: Starter': {
        en: 'Website: Starter', pt: 'Website: Starter', de: 'Website: Starter',
        desc_en: '1 full page, Google Business, Email, Analytics',
        desc_pt: '1 página completa, Google Business, Email, Analytics',
        desc_de: '1 vollständige Seite, Google Business, E-Mail, Analytics'
    },

    // Social
    'Social: Growth': {
        en: 'Social: Growth', pt: 'Social: Crescimento', de: 'Social: Wachstum',
        desc_en: '2 platforms, 12 posts/month',
        desc_pt: '2 plataformas, 12 posts/mês',
        desc_de: '2 Plattformen, 12 Posts/Monat'
    },
    'Social: Pro': {
        en: 'Social: Pro', pt: 'Social: Pro', de: 'Social: Pro',
        desc_en: '3 platforms, 16 posts + reels',
        desc_pt: '3 plataformas, 16 posts + reels',
        desc_de: '3 Plattformen, 16 Posts + Reels'
    },
    'Social: One-Time Setup': {
        en: 'Social: One-Time Setup', pt: 'Social: Setup Único', de: 'Social: Einmaliges Setup',
        desc_en: 'Profile configuration and bio (all platforms)',
        desc_pt: 'Configuração de perfis e bio (todas plataformas)',
        desc_de: 'Profilkonfiguration und Bio (alle Plattformen)'
    },
    'Social: Starter': {
        en: 'Social: Starter', pt: 'Social: Starter', de: 'Social: Starter',
        desc_en: '1 platform, 8 posts/month',
        desc_pt: '1 plataforma, 8 posts/mês',
        desc_de: '1 Plattform, 8 Posts/Monat'
    },
};

const lines = fileContent.split(/\r\n|\n/).filter(l => l.trim() !== '');
const header = lines[0];
const dataLines = lines.slice(1);

const pack = (val: string) => {
    if (val === undefined || val === null) return '';
    val = String(val).replace(/"/g, '""');
    if (val.search(/("|,|\n)/g) >= 0) val = `"${val}"`;
    return val;
};

// Basic CSV splitter
const splitCSV = (line: string) => {
    const parts = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { parts.push(current); current = ''; }
        else { current += char; }
    }
    parts.push(current);
    return parts;
};

const processed = dataLines.map(line => {
    const parts = splitCSV(line);
    // name,price,price_eur,billing_type,active,name_en,name_pt,name_de,description_en,description_pt,description_de
    const originalName = parts[0];

    const dictEntry = translations[originalName];

    if (dictEntry) {
        // Update Names
        parts[0] = pack(dictEntry.en);
        parts[5] = pack(dictEntry.en);
        parts[6] = pack(dictEntry.pt);
        parts[7] = pack(dictEntry.de);

        // Update Descriptions
        parts[8] = pack(dictEntry.desc_en);
        parts[9] = pack(dictEntry.desc_pt);
        parts[10] = pack(dictEntry.desc_de);
    } else {
        console.warn(`No translation found for service: "${originalName}"`);
    }

    // Re-Pack other columns 
    parts[1] = pack(parts[1]);
    parts[2] = pack(parts[2]);
    parts[3] = pack(parts[3]);
    parts[4] = pack(parts[4]);

    return parts.join(',');
});

const newContent = [header, ...processed].join('\r\n');
fs.writeFileSync(csvPath, newContent);
console.log('Final translation complete.');
