"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/language-context";

interface DashboardUserMenuProps {
    email: string;
    avatarUrl?: string | null;
    clientName: string;
}

export function DashboardUserMenu({ email, avatarUrl, clientName }: DashboardUserMenuProps) {
    const router = useRouter();
    const supabase = createClient();
    const { t } = useLanguage();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
                <div className="flex items-center gap-3 pl-4 cursor-pointer hover:opacity-80 transition-opacity h-full">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={avatarUrl || ''} alt={clientName} />
                        <AvatarFallback>{clientName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden md:inline-block whitespace-nowrap">{clientName}</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 sm:w-56">
                <DropdownMenuLabel className="py-3 text-base sm:text-sm font-semibold">{clientName}</DropdownMenuLabel>
                <div className="px-2 pb-3 text-sm sm:text-xs text-muted-foreground truncate">
                    {email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="py-3 sm:py-2">
                    <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-3 sm:mr-2 h-5 w-5 sm:h-4 sm:w-4" />
                        <span className="text-base sm:text-sm">{t.dashboard.settings}</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive py-3 sm:py-2">
                    <LogOut className="mr-3 sm:mr-2 h-5 w-5 sm:h-4 sm:w-4" />
                    <span className="text-base sm:text-sm">{t.dashboard.signOut}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
