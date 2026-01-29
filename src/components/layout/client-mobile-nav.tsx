'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MobileNavLink {
    title: string;
    href: string;
    icon: LucideIcon;
}

interface ClientMobileNavProps {
    links: MobileNavLink[];
}

export function ClientMobileNav({ links }: ClientMobileNavProps) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    // Mount check for portal
    useEffect(() => {
        setMounted(true);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    const close = () => setOpen(false);

    // Full-screen overlay rendered via portal to document.body
    const overlay = (
        <div
            className={cn(
                'fixed inset-0 bg-slate-950 transition-all duration-300',
                open ? 'opacity-100 visible' : 'opacity-0 invisible'
            )}
            style={{ zIndex: 99999 }}
            aria-hidden={!open}
        >
            <div className="flex h-full w-full flex-col bg-slate-950">
                {/* Top bar with close button */}
                <div className="flex h-14 items-center justify-between border-b border-slate-800 px-4 shrink-0 bg-slate-950">
                    <span className="text-sm font-medium text-slate-400">Menu</span>
                    <button
                        type="button"
                        onClick={close}
                        className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-800 transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="h-6 w-6 text-slate-50" />
                    </button>
                </div>

                {/* Brand: neon-style lopes2tech text above menu items */}
                <div className="flex justify-center pt-6 pb-2 shrink-0 bg-slate-950">
                    <span
                        className="text-3xl font-bold tracking-tight select-none"
                        style={{ fontFamily: 'system-ui, sans-serif' }}
                    >
                        <span
                            className="text-cyan-300"
                            style={{
                                textShadow: '0 0 8px rgb(34 211 238), 0 0 16px rgb(34 211 238), 0 0 24px rgb(34 211 238)',
                            }}
                        >
                            lopes
                        </span>
                        <span
                            className="text-fuchsia-400"
                            style={{
                                textShadow: '0 0 8px rgb(217 70 239), 0 0 16px rgb(217 70 239), 0 0 24px rgb(217 70 239)',
                            }}
                        >
                            2
                        </span>
                        <span
                            className="text-amber-400"
                            style={{
                                textShadow: '0 0 8px rgb(251 191 36), 0 0 16px rgb(251 191 36), 0 0 24px rgb(251 191 36)',
                            }}
                        >
                            tech
                        </span>
                    </span>
                </div>

                {/* Centered grid: 3 per row with icon + name - fills remaining space with bg */}
                <div className="flex-1 flex items-center justify-center p-4 bg-slate-950">
                    <nav className="grid grid-cols-3 gap-4 w-full max-w-md">
                        {links.map((link) => {
                            const isActive =
                                pathname === link.href || pathname.startsWith(link.href + '/');
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={close}
                                    className={cn(
                                        'flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-colors min-h-[96px] bg-slate-900 text-slate-50',
                                        isActive
                                            ? 'ring-2 ring-primary text-primary'
                                            : 'hover:bg-slate-800'
                                    )}
                                >
                                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                                        <Icon className="h-6 w-6" />
                                    </span>
                                    <span className="text-center text-xs font-medium leading-tight">
                                        {link.title}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Burger button with flashing indicator */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-muted/80 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Open menu"
            >
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                <Menu className="h-6 w-6 text-foreground animate-pulse" />
            </button>

            {/* Portal the overlay to document.body so it's truly full-screen */}
            {mounted && createPortal(overlay, document.body)}
        </>
    );
}
