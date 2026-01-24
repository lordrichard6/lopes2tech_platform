'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useState } from 'react';

export interface SidebarLink {
    title: string;
    href: string;
    icon: LucideIcon;
}

interface SidebarProps {
    links: SidebarLink[];
    bottomLinks?: SidebarLink[]; // For settings, logout etc if needed structurally
}

export function Sidebar({ links, bottomLinks }: SidebarProps) {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-[100dvh] bg-card border-r transition-all duration-300 ease-in-out flex flex-col",
                isHovered ? "w-64" : "w-16"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={cn(
                "flex h-14 items-center justify-center border-b px-4 shrink-0",
                isHovered ? "justify-start" : "justify-center"
            )}>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-cyan-500/20">
                    L
                </div>
                <span className={cn(
                    "ml-2 font-bold text-lg whitespace-nowrap overflow-hidden transition-all duration-300",
                    isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
                )}>
                    <span className="text-foreground">lopes</span>
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">2</span>
                    <span className="text-foreground">tech</span>
                </span>
            </div>

            <nav className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent">
                {links.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-2 px-2 py-2 rounded-md transition-colors whitespace-nowrap overflow-hidden group relative",
                                isHovered ? "justify-start" : "justify-center",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <link.icon className="h-5 w-5 shrink-0" />
                            <span className={cn(
                                "transition-all duration-300",
                                isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 absolute left-10"
                            )}>
                                {link.title}
                            </span>
                            {/* Tooltip for collapsed state */}
                            {!isHovered && (
                                <div className="absolute left-14 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {link.title}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>


        </aside>
    );
}
