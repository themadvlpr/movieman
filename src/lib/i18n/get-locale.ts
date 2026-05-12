import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALES, Locale } from './languageconfig';

export async function getLocale(): Promise<Locale> {
    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value as Locale;

    if (locale && LOCALES.includes(locale)) {
        return locale;
    }

    return DEFAULT_LOCALE;
}
