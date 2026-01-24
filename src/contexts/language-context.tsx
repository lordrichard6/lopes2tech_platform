"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Locale, dictionaries, Dictionary } from '@/lib/i18n/dictionaries';

type LanguageContextType = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: Dictionary;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');

    useEffect(() => {
        // Load from cookie on mount
        const match = document.cookie.match(new RegExp('(^| )NEXT_LOCALE=([^;]+)'));
        if (match) {
            const storedLocale = match[2] as Locale;
            if (['en', 'pt', 'de'].includes(storedLocale)) {
                setLocaleState(storedLocale);
            }
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        // Save to cookie (expires in 1 year)
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t: dictionaries[locale] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
