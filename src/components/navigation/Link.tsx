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
            // Only prepend if it doesn't already have it (just a safety check, usually not needed)
            if (!href.startsWith(`/${locale}/`) && href !== `/${locale}`) {
                localizedHref = isDefault ? href : `/${locale}${href === '/' ? '' : href}`;
            }
        }
        
        return <NextLink href={localizedHref} ref={ref} {...props} />;
    }
);

LocalizedLink.displayName = 'LocalizedLink';
