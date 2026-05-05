import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/languageconfig';

function getBrowserLocale(request: NextRequest): string | undefined {
    const acceptLanguage = request.headers.get('accept-language');
    if (!acceptLanguage) return undefined;

    // Simple parser for Accept-Language header (e.g., "ru-RU,ru;q=0.9,en-US;q=0.8")
    const preferredLocales = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].trim().split('-')[0])
        .filter(lang => LOCALES.includes(lang as any));

    return preferredLocales[0];
}

export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-current-path', pathname);

    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;


    const pathnameHasLocale = LOCALES.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) {
        // If it explicitly starts with the default locale (en), redirect to the path without it
        if (pathname.startsWith(`/${DEFAULT_LOCALE}/`) || pathname === `/${DEFAULT_LOCALE}`) {
            const newPathname = pathname.replace(`/${DEFAULT_LOCALE}`, '') || '/';
            return NextResponse.redirect(new URL(`${newPathname}${search}`, request.url));
        }

        return NextResponse.next({
            request: { headers: requestHeaders }
        });
    }

    // Determine target locale: cookie first, then browser language
    const targetLocale = cookieLocale || getBrowserLocale(request);

    // REDIRECT: If visit root and has a non-default locale preference, redirect to it
    if (pathname === '/' && targetLocale && targetLocale !== DEFAULT_LOCALE && LOCALES.includes(targetLocale as any)) {
        return NextResponse.redirect(new URL(`/${targetLocale}${search}`, request.url));
    }

    // Rewrite if it has no locale to fallback to default (en)
    request.nextUrl.pathname = `/${DEFAULT_LOCALE}${pathname}`;

    return NextResponse.rewrite(request.nextUrl, {
        request: { headers: requestHeaders }
    });
}

export const config = {
    matcher: [
        // Skip all internal paths (_next, images, api, static files ending in extensions)
        '/((?!api|_next/static|_next/image|favicon.ico|icons|images|.*\\..*).*)',
    ],
};
