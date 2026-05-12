'use client';

import NextLink from 'next/link';
import { useTranslation } from '@/providers/LocaleProvider';
import { ComponentProps, forwardRef } from 'react';
import { DEFAULT_LOCALE } from '@/lib/i18n/languageconfig';

export const LocalizedLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(
    ({ href, ...props }, ref) => {
        const { locale } = useTranslation();
        let localizedHref = href;
        
        if (typeof href === 'string' && href.startsWith('/')) {
            const isDefault = locale === DEFAULT_LOCALE;
            const isAlreadyLocalized = href === `/${locale}` || 
                                     href.startsWith(`/${locale}/`) || 
                                     href.startsWith(`/${locale}?`) || 
                                     href.startsWith(`/${locale}#`);

            if (!isAlreadyLocalized) {
                localizedHref = isDefault ? href : `/${locale}${href === '/' ? '' : href}`;
            }
        }
        
        return <NextLink href={localizedHref} ref={ref} {...props} />;
    }
);

LocalizedLink.displayName = 'LocalizedLink';
