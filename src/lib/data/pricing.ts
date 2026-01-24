// Lopes2Tech Service Pricing Data
// Based on tabela_servicos_precos.md (January 2025)

export type Currency = 'CHF' | 'EUR';

export interface ServiceItem {
    id: string;
    name: string;
    description: string;
    category: string;
    priceCHF: number | [number, number]; // Single price or range [min, max]
    priceEUR: number | [number, number];
    timeline?: string;
    recurring?: 'monthly' | 'annual' | 'one-time';
}

export interface ServiceCategory {
    id: string;
    name: string;
    nameEN: string;
    services: ServiceItem[];
}

export const PRICING_DATA: ServiceCategory[] = [
    {
        id: 'websites',
        name: 'Websites & Landing Pages',
        nameEN: 'Websites & Landing Pages',
        services: [
            {
                id: 'landing-page',
                name: 'Landing Page',
                description: 'Design responsivo, formulário de contacto, SEO básico',
                category: 'websites',
                priceCHF: 720,
                priceEUR: 420,
                timeline: '3-5 dias',
                recurring: 'one-time',
            },
            {
                id: 'starter',
                name: 'Starter (1 página + GBP + email)',
                description: 'Website 1 página, Google Business Profile, email profissional, GA4',
                category: 'websites',
                priceCHF: [1020, 1440],
                priceEUR: [600, 840],
                timeline: '1 semana',
                recurring: 'one-time',
            },
            {
                id: 'starter-plus',
                name: 'Starter Plus (+ Branding)',
                description: 'Starter + Logótipo (3 variações), paleta de cores, kit redes sociais',
                category: 'websites',
                priceCHF: [1680, 2280],
                priceEUR: [960, 1320],
                timeline: '1-2 semanas',
                recurring: 'one-time',
            },
            {
                id: 'business-pro',
                name: 'Business Pro (3-5 páginas + SEO)',
                description: 'Website 3-5 páginas, SEO avançado, captação de leads, integração CRM',
                category: 'websites',
                priceCHF: [2400, 3840],
                priceEUR: [1440, 2280],
                timeline: '2 semanas',
                recurring: 'one-time',
            },
            {
                id: 'multi-page',
                name: 'Multi-Page 6+',
                description: 'Website 6+ páginas, funcionalidades personalizadas',
                category: 'websites',
                priceCHF: [4200, 6000],
                priceEUR: [2400, 3600],
                timeline: '2-3 semanas',
                recurring: 'one-time',
            },
        ],
    },
    {
        id: 'branding',
        name: 'Branding & Identidade Visual',
        nameEN: 'Branding & Visual Identity',
        services: [
            {
                id: 'logo-simple',
                name: 'Logótipo Simples',
                description: '3 conceitos, 2 revisões, ficheiros finais (PNG, SVG, PDF)',
                category: 'branding',
                priceCHF: 420,
                priceEUR: 240,
                timeline: '3-5 dias',
                recurring: 'one-time',
            },
            {
                id: 'brand-kit',
                name: 'Kit de Marca Completo',
                description: 'Logótipo, paleta de cores, tipografia, guia de uso, kit redes sociais',
                category: 'branding',
                priceCHF: 780,
                priceEUR: 480,
                timeline: '1 semana',
                recurring: 'one-time',
            },
            {
                id: 'rebrand',
                name: 'Rebrand Completo',
                description: 'Kit de Marca + análise, estratégia, templates, assinatura email',
                category: 'branding',
                priceCHF: 1440,
                priceEUR: 840,
                timeline: '1-2 semanas',
                recurring: 'one-time',
            },
        ],
    },
    {
        id: 'hosting',
        name: 'Hosting & Domínio',
        nameEN: 'Hosting & Domain',
        services: [
            {
                id: 'domain-setup',
                name: 'Configuração Domínio + Hosting',
                description: 'Configuração inicial, SSL, DNS',
                category: 'hosting',
                priceCHF: 230,
                priceEUR: 138,
                recurring: 'one-time',
            },
            {
                id: 'host-migration',
                name: 'Migração de Host',
                description: 'Migração completa de website existente',
                category: 'hosting',
                priceCHF: 403,
                priceEUR: 230,
                recurring: 'one-time',
            },
            {
                id: 'hosting-monthly',
                name: 'Hosting Mensal',
                description: 'Hosting rápido e seguro, SSL, backups, monitorização',
                category: 'hosting',
                priceCHF: 45,
                priceEUR: 29,
                recurring: 'monthly',
            },
            {
                id: 'hosting-annual',
                name: 'Hosting Anual',
                description: 'Hosting anual (2 meses grátis)',
                category: 'hosting',
                priceCHF: 449,
                priceEUR: 288,
                recurring: 'annual',
            },
        ],
    },
    {
        id: 'support',
        name: 'Planos de Suporte Mensal',
        nameEN: 'Monthly Support Plans',
        services: [
            {
                id: 'just-hosting',
                name: 'Just Hosting',
                description: 'Hosting, SSL, backups, monitorização 24/7, suporte email (48h)',
                category: 'support',
                priceCHF: 45,
                priceEUR: 29,
                recurring: 'monthly',
            },
            {
                id: 'essential-care',
                name: 'Essential Care',
                description: 'Just Hosting + atualizações semanais, 1h suporte/mês, resposta 24h',
                category: 'support',
                priceCHF: 102,
                priceEUR: 63,
                recurring: 'monthly',
            },
            {
                id: 'growth-care',
                name: 'Growth Care',
                description: 'Essential + relatório SEO, 2h suporte, sugestões proativas, chamada mensal',
                category: 'support',
                priceCHF: 206,
                priceEUR: 127,
                recurring: 'monthly',
            },
        ],
    },
    {
        id: 'automation',
        name: 'Automatização de Negócios',
        nameEN: 'Business Automation',
        services: [
            {
                id: 'micro-form',
                name: 'Formulário Micro',
                description: 'Formulário no website, notificação email, resposta automática',
                category: 'automation',
                priceCHF: 359,
                priceEUR: 216,
                timeline: '1-2 dias',
                recurring: 'one-time',
            },
            {
                id: 'lead-capture',
                name: 'Sistema de Captação de Leads',
                description: 'Formulário avançado, integração CRM, email boas-vindas, Google Sheets',
                category: 'automation',
                priceCHF: 660,
                priceEUR: 396,
                timeline: '3-5 dias',
                recurring: 'one-time',
            },
            {
                id: 'review-collection',
                name: 'Coleção de Reviews',
                description: 'Sequência 3 emails, link Google Reviews, timing otimizado',
                category: 'automation',
                priceCHF: 479,
                priceEUR: 288,
                timeline: '3-5 dias',
                recurring: 'one-time',
            },
            {
                id: 'booking-system',
                name: 'Sistema de Agendamentos',
                description: 'Cal.com/Calendly, Google Calendar, confirmação automática, lembretes',
                category: 'automation',
                priceCHF: 540,
                priceEUR: 324,
                timeline: '2-3 dias',
                recurring: 'one-time',
            },
        ],
    },
    {
        id: 'ai',
        name: 'Integrações de IA',
        nameEN: 'AI Integrations',
        services: [
            {
                id: 'chatbot-faq',
                name: 'Chatbot FAQ',
                description: 'Widget de chat, treinado com FAQ, escalação para humano (+custos API)',
                category: 'ai',
                priceCHF: 875,
                priceEUR: 525,
                timeline: '1 semana',
                recurring: 'one-time',
            },
            {
                id: 'knowledge-base',
                name: 'Base de Conhecimento RAG',
                description: 'Upload documentos, motor de pesquisa inteligente, atualização contínua',
                category: 'ai',
                priceCHF: 1875,
                priceEUR: 1125,
                timeline: '1-2 semanas',
                recurring: 'one-time',
            },
            {
                id: 'ai-support-flow',
                name: 'Fluxo de Suporte IA',
                description: 'Sistema híbrido IA+humano, triagem automática, dashboard métricas',
                category: 'ai',
                priceCHF: 3125,
                priceEUR: 1875,
                timeline: '2-3 semanas',
                recurring: 'one-time',
            },
        ],
    },
    {
        id: 'quickwins',
        name: 'Serviços Rápidos',
        nameEN: 'Quick Wins',
        services: [
            {
                id: 'website-audit',
                name: 'Auditoria de Website',
                description: 'PDF 1 página, 5 melhorias, priorização, proposta next steps',
                category: 'quickwins',
                priceCHF: 179,
                priceEUR: 108,
                recurring: 'one-time',
            },
            {
                id: 'speed-optimization',
                name: 'Otimização de Velocidade',
                description: 'Compressão imagens, cache, otimização código, relatório',
                category: 'quickwins',
                priceCHF: 215,
                priceEUR: 132,
                recurring: 'one-time',
            },
            {
                id: 'gbp-boost',
                name: 'Google Business Boost',
                description: 'Otimização perfil, 3 publicações, categorias, dicas manutenção',
                category: 'quickwins',
                priceCHF: 119,
                priceEUR: 72,
                recurring: 'one-time',
            },
        ],
    },
];

// Helper to get price display
export function formatPrice(
    price: number | [number, number],
    currency: Currency
): string {
    const symbol = currency === 'CHF' ? 'CHF' : '€';
    if (Array.isArray(price)) {
        return `${symbol} ${price[0].toLocaleString()} - ${price[1].toLocaleString()}`;
    }
    return `${symbol} ${price.toLocaleString()}`;
}

// Helper to get base price (for calculations, uses min of range)
export function getBasePrice(price: number | [number, number]): number {
    return Array.isArray(price) ? price[0] : price;
}

// Helper to get the price for a currency
export function getPriceForCurrency(
    service: ServiceItem,
    currency: Currency
): number | [number, number] {
    return currency === 'CHF' ? service.priceCHF : service.priceEUR;
}
