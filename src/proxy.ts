import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    locales: ['en', 'ru', 'ua'],
    defaultLocale: 'en',
    localePrefix: 'as-needed'
});

export const config = {
    matcher: ['/', '/(ru|ua|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};