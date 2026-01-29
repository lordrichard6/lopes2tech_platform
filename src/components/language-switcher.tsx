"use client";

import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage();

    const languages = {
        en: "English",
        pt: "Português",
        de: "Deutsch"
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
                    <Globe className="h-4 w-4" />
                    <span className="sr-only">Switch Language</span>
                    <span className="absolute bottom-1 right-1 text-[9px] font-bold uppercase leading-none">{locale}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
                <DropdownMenuItem 
                    onClick={() => setLocale('en')} 
                    className={`py-3 sm:py-2 text-base sm:text-sm cursor-pointer ${locale === 'en' ? 'bg-accent' : ''}`}
                >
                    🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={() => setLocale('pt')} 
                    className={`py-3 sm:py-2 text-base sm:text-sm cursor-pointer ${locale === 'pt' ? 'bg-accent' : ''}`}
                >
                    🇵🇹 Português
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={() => setLocale('de')} 
                    className={`py-3 sm:py-2 text-base sm:text-sm cursor-pointer ${locale === 'de' ? 'bg-accent' : ''}`}
                >
                    🇨🇭 Deutsch
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
