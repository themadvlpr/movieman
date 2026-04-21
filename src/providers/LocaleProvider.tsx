'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Locale, DEFAULT_LOCALE, LOCALES } from '@/lib/i18n/languageconfig';
import { translations } from '@/lib/i18n/translation';
import { useRouter, usePathname } from 'next/navigation';

type TranslationContextType = {
    locale: Locale;
    setLocale: (newLocale: Locale) => void;
    t: (category: string, key: string) => string;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function LocaleProvider({ children, initialLocale = DEFAULT_LOCALE }: { children: React.ReactNode, initialLocale?: Locale }) {
    // Validate if the initialLocale is actually supported, otherwise fallback
    const validLocale = LOCALES.includes(initialLocale) ? initialLocale : DEFAULT_LOCALE;
    const [locale, setLocaleState] = useState<Locale>(validLocale);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (validLocale !== locale) {
            setLocaleState(validLocale);
        }
    }, [validLocale]);

    useEffect(() => {
        // Fallback or initialization for first timers with no cookie
        if (!Cookies.get('NEXT_LOCALE')) {
            const browserLang = navigator.language.split('-')[0] as Locale;
            if (LOCALES.includes(browserLang) && browserLang !== validLocale && pathname === '/') {
                // optional: redirect them once if you want, but for now we just set the cookie
                Cookies.set('NEXT_LOCALE', browserLang, { expires: 365 });
            }
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        if (newLocale === locale) return;
        Cookies.set('NEXT_LOCALE', newLocale, { expires: 365 });
        
        let newPath = pathname;
        // Strip current locale from start
        if (locale !== DEFAULT_LOCALE && newPath.startsWith(`/${locale}`)) {
            newPath = newPath.replace(`/${locale}`, '') || '/';
        }
        
        // Prepend new locale if not default
        if (newLocale !== DEFAULT_LOCALE) {
            newPath = `/${newLocale}${newPath === '/' ? '' : newPath}`;
        }
        
        setLocaleState(newLocale);
        router.push(newPath);
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
