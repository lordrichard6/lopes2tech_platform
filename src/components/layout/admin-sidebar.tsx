'use client';

import { Sidebar } from './sidebar';
import { Users, FolderKanban, FileText, Inbox, ShoppingBag, LayoutDashboard, Sparkles } from 'lucide-react';

export function AdminSidebar() {
    const links = [
        { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { title: 'Clients', href: '/admin/clients', icon: Users },
        { title: 'Projects', href: '/admin/projects', icon: FolderKanban },
        { title: 'Services', href: '/admin/services', icon: ShoppingBag },
        { title: 'Inbox', href: '/admin/inbox', icon: Inbox },
        { title: 'Invoices', href: '/admin/invoices', icon: FileText },
        { title: 'Super Agent', href: '/admin/super-agent', icon: Sparkles },
    ];

    return <Sidebar links={links} />;
}
