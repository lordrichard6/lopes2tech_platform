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
                <div className="flex items-center gap-3 pl-4 cursor-pointer hover:opacity-80 transition-opacity">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={avatarUrl || ''} alt={clientName} />
                        <AvatarFallback>{clientName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden md:inline-block">{clientName}</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{clientName}</DropdownMenuLabel>
                <div className="px-2 pb-2 text-xs text-muted-foreground truncate">
                    {email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>{t.dashboard.profile}</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t.dashboard.settings}</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t.dashboard.signOut}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
