'use client';

import { Sidebar } from './sidebar';
import { Folder, Inbox, FileText, Files, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export function ClientSidebar() {
    const { t } = useLanguage();
    const links = [
        { title: t.sidebar.dashboard, href: '/dashboard', icon: LayoutDashboard },
        { title: t.sidebar.projects, href: '/dashboard/projects', icon: Folder },
        { title: t.sidebar.tasks, href: '/dashboard/tasks', icon: Inbox },
        { title: t.sidebar.documents, href: '/dashboard/documents', icon: Files },
        { title: t.sidebar.invoices, href: '/dashboard/invoices', icon: FileText },
    ];

    return <Sidebar links={links} />;
}
