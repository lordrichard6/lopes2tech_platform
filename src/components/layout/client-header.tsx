'use client';

import { useLanguage } from '@/contexts/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { DashboardUserMenu } from '@/components/layout/dashboard-user-menu';
import { ClientMobileNav } from '@/components/layout/client-mobile-nav';
import { Folder, Inbox, FileText, Files, LayoutDashboard, CreditCard } from 'lucide-react';

interface ClientHeaderProps {
    email: string;
    avatarUrl: string;
    clientName: string;
}

export function ClientHeader({ email, avatarUrl, clientName }: ClientHeaderProps) {
    const { t } = useLanguage();
    const links = [
        { title: t.sidebar.dashboard, href: '/dashboard', icon: LayoutDashboard },
        { title: t.sidebar.projects, href: '/projects', icon: Folder },
        { title: t.sidebar.requests, href: '/requests', icon: Inbox },
        { title: t.sidebar.documents, href: '/documents', icon: Files },
        { title: t.sidebar.invoices, href: '/invoices', icon: FileText },
        { title: t.sidebar.subscriptions, href: '/subscriptions', icon: CreditCard },
    ];

    return (
        <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4">
                {/* Mobile: burger menu. Desktop: spacer (sidebar has logo) */}
                <div className="flex items-center md:hidden">
                    <ClientMobileNav links={links} />
                </div>
                <div className="hidden md:block md:w-0" aria-hidden />
                <div className="flex items-center gap-3 h-full">
                    <LanguageSwitcher />
                    <NotificationBell />
                    <DashboardUserMenu
                        email={email}
                        avatarUrl={avatarUrl}
                        clientName={clientName}
                    />
                </div>
            </div>
        </header>
    );
}
