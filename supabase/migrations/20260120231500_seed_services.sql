-- Seed services from Pricing Table (Jan 2025)
-- Prices in CHF (Selling Price)

INSERT INTO services (name, description, price, billing_type, active) VALUES
-- 1. Websites & Landing Pages
('Website: Landing Page', 'Design responsivo, formulário contacto, SEO básico', 720, 'one_time', true),
('Website: Starter', '1 página completa, Google Business, Email, Analytics', 1200, 'one_time', true),
('Website: Starter Plus', 'Starter + Logótipo, Branding Kit, Social Kit', 1680, 'one_time', true),
('Website: Business Pro', '3-5 páginas, SEO avançado, CRM básico, Relatórios', 2400, 'one_time', true),
('Website: Multi-Page 6+', '6+ páginas, custom features, complex SEO', 4200, 'one_time', true),

-- 2. Branding
('Branding: Logótipo Simples', '3 conceitos, 2 revisões, ficheiros finais', 420, 'one_time', true),
('Branding: Kit de Marca', 'Logo, cores, tipografia, guia de marca, social kit', 780, 'one_time', true),
('Branding: Rebrand Completo', 'Kit completo + estratégia, análise, templates', 1440, 'one_time', true),

-- 3. Hosting
('Hosting: Configuração + Domínio', 'Setup de domínio e hosting Vercel/Railway', 230, 'one_time', true),
('Hosting: Migração', 'Migração de host existente', 403, 'one_time', true),
('Hosting: Mensal', 'Hosting, SSL, Backups, Monitorização 24/7', 45, 'monthly', true),
('Hosting: Anual', 'Hosting, SSL, Backups, Monitorização 24/7 (2 meses grátis)', 449, 'yearly', true),

-- 4. Support Plans
('Care: Essential (Mensal)', 'Hosting + Updates semanais, 1h suporte, Prioritário', 102, 'monthly', true),
('Care: Essential (Anual)', 'Hosting + Updates semanais, 1h suporte, Prioritário', 1024, 'yearly', true),
('Care: Growth (Mensal)', 'Essential + Relatório SEO, 2h suporte, Consultoria mensal', 206, 'monthly', true),
('Care: Growth (Anual)', 'Essential + Relatório SEO, 2h suporte, Consultoria mensal', 2059, 'yearly', true),

-- 5. Automation
('Auto: Formulário Micro', 'Formulário com notificações automáticas', 359, 'one_time', true),
('Auto: Captação de Leads', 'Formulário CRM, Welcome Email, Notificações equipa', 660, 'one_time', true),
('Auto: Coleção de Reviews', 'Sequência de emails, link Google Reviews', 479, 'one_time', true),
('Auto: Agendamentos', 'Integração Calendly/Cal.com, sync Google Calendar', 540, 'one_time', true),
('Auto: Integração Custom', 'n8n workflows, pagamentos, conexões API complexas', 1080, 'one_time', true),

-- 6. AI Integrations
('AI: Chatbot FAQ', 'Widget treinado, respostas automáticas, handoff humano', 875, 'one_time', true),
('AI: Base de Conhecimento RAG', 'Pesquisa inteligente em documentos da empresa', 1875, 'one_time', true),
('AI: Fluxo Suporte IA', 'Triagem automática, respostas híbridas, dashboard', 3125, 'one_time', true),

-- 7. Web Apps
('WebApp: Portal Cliente', 'Login seguro, documentos, status, comunicação', 4375, 'one_time', true),
('WebApp: Dashboard Interno', 'KPIs, gráficos, exportação dados, filtros', 6875, 'one_time', true),
('WebApp: App Personalizada', 'Desenvolvimento à medida, Stripe, Users, API', 10000, 'one_time', true),

-- 8. Marketing - Ads (Management Fee)
('Ads: Visibility Starter', 'Gestão Google Ads até CHF 300 spend', 299, 'monthly', true),
('Ads: Visibility Pro', 'Gestão Google Ads até CHF 600 spend', 479, 'monthly', true),
('Ads: Visibility Max', 'Gestão Google Ads até CHF 1000 spend', 719, 'monthly', true),
('Ads: Setup Único', 'Configuração de conta e campanhas sem gestão mensal', 479, 'one_time', true),

-- 8. Marketing - Social
('Social: Starter', '1 plataforma, 8 posts/mês', 359, 'monthly', true),
('Social: Growth', '2 plataformas, 12 posts/mês', 539, 'monthly', true),
('Social: Pro', '3 plataformas, 16 posts + reels', 779, 'monthly', true),
('Social: Setup Único', 'Configuração de perfis e bio (todas plataformas)', 359, 'one_time', true),

-- 8. Marketing - Leads
('Leads: Starter', 'Landing page, form, notificações', 419, 'monthly', true),
('Leads: Growth', 'Starter + Email nurturing + Review mensal', 659, 'monthly', true),
('Leads: Pro', 'Growth + A/B testing + Retargeting', 959, 'monthly', true),
('Leads: Magnet Setup', 'Criação de PDF + Landing page one-shot', 599, 'one_time', true),

-- 9. Combined Success Bundles
('Bundle: Starter Success', 'Essential Care + 3h retainer', 459, 'monthly', true),
('Bundle: Growth Success', 'Growth Care + 6h retainer', 861, 'monthly', true),
('Bundle: Scale Success', 'Growth Care + 12h retainer + Priority', 1494, 'monthly', true),

-- 10. Quick Wins
('Quick: Auditoria Website', 'Análise UX/UI/SEO, PDF com melhorias', 179, 'one_time', true),
('Quick: Speed Optimization', 'Cache, imagens, código minificado', 215, 'one_time', true),
('Quick: Google Business', 'Otimização perfil, posts iniciais', 119, 'one_time', true),

-- 11. Retainers
('Retainer: Lite (6h)', 'Banco de horas mensal (CHF 105/h)', 725, 'monthly', true),
('Retainer: Pro (12h)', 'Banco de horas mensal (CHF 100/h)', 1380, 'monthly', true),
('Retainer: Enterprise (20h)', 'Banco de horas mensal (CHF 95/h)', 2185, 'monthly', true)
ON CONFLICT DO NOTHING;
