export const LOCALES = ['en', 'ru', 'ua'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
    en: 'English',
    ru: 'Русский',
    ua: 'Українська',
};

export const TMDB_LANGUAGES: Record<Locale, string> = {
    en: 'en-US',
    ru: 'ru-RU',
    ua: 'uk-UA',
};