'use client';

import { Sidebar } from './sidebar';
import { Folder, Inbox, FileText, Files, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export function ClientSidebar() {
    const { t } = useLanguage();
    const links = [
        { title: t.sidebar.dashboard, href: '/dashboard', icon: LayoutDashboard },
        { title: t.sidebar.projects, href: '/projects', icon: Folder },
        { title: t.sidebar.requests, href: '/requests', icon: Inbox },
        { title: t.sidebar.documents, href: '/documents', icon: Files },
        { title: t.sidebar.invoices, href: '/invoices', icon: FileText },
    ];

    return <Sidebar links={links} />;
}
