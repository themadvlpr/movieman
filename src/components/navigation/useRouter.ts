'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@/providers/LocaleProvider';
import { DEFAULT_LOCALE } from '@/lib/i18n/languageconfig';

export function useLocalizedRouter() {
    const router = useRouter();
    const { locale } = useTranslation();

    const push = (href: string, options?: any) => {
        let localizedHref = href;
        if (typeof href === 'string' && href.startsWith('/')) {
            const isDefault = locale === DEFAULT_LOCALE;
            if (!href.startsWith(`/${locale}/`) && href !== `/${locale}`) {
                localizedHref = isDefault ? href : `/${locale}${href === '/' ? '' : href}`;
            }
        }
        return router.push(localizedHref, options);
    };

    const replace = (href: string, options?: any) => {
        let localizedHref = href;
        if (typeof href === 'string' && href.startsWith('/')) {
            const isDefault = locale === DEFAULT_LOCALE;
            if (!href.startsWith(`/${locale}/`) && href !== `/${locale}`) {
                localizedHref = isDefault ? href : `/${locale}${href === '/' ? '' : href}`;
            }
        }
        return router.replace(localizedHref, options);
    };

    return {
        ...router,
        push,
        replace,
    };
}
