import { defineRouting } from 'next-intl/routing';
import { Locale } from 'next-intl';

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['en', 'ru', 'ua'],

    // Used when no locale matches
    defaultLocale: 'en'
});
