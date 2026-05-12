import { DEFAULT_LOCALE } from './languageconfig';

/**
 * Prepends the locale to the path if it's not the default locale.
 * @param path The path to localize (should start with /)
 * @param locale The current locale
 * @returns The localized path
 */
export function getLocalizedPath(path: string, locale: string): string {
    if (!path.startsWith('/')) {
        path = '/' + path;
    }
    
    if (locale === DEFAULT_LOCALE) {
        return path;
    }
    
    return `/${locale}${path === '/' ? '' : path}`;
}

/**
 * Returns the full localized URL for sharing.
 * @param path The path to localize (can be just /movies or /movies/123)
 * @param locale The current locale
 * @returns The full localized URL
 */
export function getLocalizedUrl(path: string, locale: string): string {
    if (typeof window === 'undefined') return '';
    
    const localizedPath = getLocalizedPath(path, locale);
    return `${window.location.origin}${localizedPath}`;
}

/**
 * Checks if the current pathname matches a given route, specifically ignoring the locale prefix.
 */
export function isActiveRoute(pathname: string, route: string, locale: string): boolean {
    if (route === '/') {
        return pathname === '/' || pathname === `/${locale}`;
    }
    
    return pathname === route || pathname === `/${locale}${route}`;
}
