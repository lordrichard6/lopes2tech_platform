"use client";

import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage();

    const languages = {
        en: "English",
        de: "Deutsch",
        pt: "Português"
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-white/70 hover:text-white hover:bg-white/10">
                    <Globe className="h-4 w-4" />
                    <span>{languages[locale]}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocale('en')}>
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale('de')}>
                    Deutsch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale('pt')}>
                    Português
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
