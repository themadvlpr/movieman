'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { LOCALES, LOCALE_LABELS, Locale } from '@/lib/i18n/languageconfig';
import { useTranslation } from '@/providers/LocaleProvider';

export default function LanguageSwitcher() {
    const { locale, setLocale, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium text-white/80 hover:text-white"
            >
                <Globe className="w-4 h-4" />
                <span className="uppercase">{locale}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-40 rounded-xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-50 py-1.5"
                    >
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/5 mb-1">
                            {t('common', 'language')}
                        </div>
                        {LOCALES.map((loc) => (
                            <button
                                key={loc}
                                onClick={() => {
                                    setLocale(loc as Locale);
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                            >
                                <span>{LOCALE_LABELS[loc as Locale]}</span>
                                {locale === loc && <Check className="w-3.5 h-3.5 text-blue-500" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
