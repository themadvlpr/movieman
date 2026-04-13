'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Locale, DEFAULT_LOCALE, LOCALES } from '@/lib/i18n/languageconfig';
import { translations } from '@/lib/i18n/translation';
import { useRouter } from 'next/navigation';

type TranslationContextType = {
    locale: Locale;
    setLocale: (newLocale: Locale) => void;
    t: (category: string, key: string) => string;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
    const router = useRouter();

    useEffect(() => {
        const savedLocale = Cookies.get('NEXT_LOCALE') as Locale;
        if (savedLocale && LOCALES.includes(savedLocale)) {
            setLocaleState(savedLocale);
        } else {
            const browserLang = navigator.language.split('-')[0] as Locale;
            if (LOCALES.includes(browserLang)) {
                setLocaleState(browserLang);
                Cookies.set('NEXT_LOCALE', browserLang, { expires: 365 });
            }
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        Cookies.set('NEXT_LOCALE', newLocale, { expires: 365 });
        // Refresh server components without full page reload
        router.refresh();
    };

    const t = (category: string, key: string): string => {
        try {
            // @ts-ignore
            const res = translations[locale][category]?.[key] || translations[DEFAULT_LOCALE][category][key];
            return res || key;
        } catch (e) {
            return key;
        }
    };

    return (
        <TranslationContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </TranslationContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(TranslationContext);

    if (!context) {
        throw new Error('useTranslation must be used within a LocaleProvider');
    }
    return context;
}
