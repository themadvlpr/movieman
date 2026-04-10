'use server'

import prisma from "@/lib/prisma";
import { translations } from "@/lib/i18n/translation";

export async function exportAllUserMediaAction(userId: string, tmdbLang: string = 'en-US') {
    if (!userId) return { success: false, error: 'Unauthorized' };

    try {
        const userMediaList = await prisma.userMedia.findMany({
            where: { userId },
            include: { media: true }
        });

        // Map TMDB locale to column names
        let titleKey: 'titleEn' | 'titleRu' | 'titleUk' = 'titleEn';
        if (tmdbLang === 'ru-RU') titleKey = 'titleRu';
        if (tmdbLang === 'uk-UA') titleKey = 'titleUk';

        userMediaList.sort((a, b) => {
            const titleA = (a.media as any)[titleKey] || a.media.titleEn || '';
            const titleB = (b.media as any)[titleKey] || b.media.titleEn || '';
            return titleA.localeCompare(titleB);
        });

        const lang = (tmdbLang.split('-')[0] as 'en' | 'ru' | 'ua') || 'en';
        const genreMap = translations[lang === 'en' ? 'en' : lang === 'ru' ? 'ru' : 'ua'].genres;

        const mappedResults = userMediaList.map(item => {
            const genres = item.media.genreIds
                ? item.media.genreIds.split(',')
                    .map(id => (genreMap as any)[id] || id)
                    .join(', ')
                : '';

            return {
                "Title": (item.media as any)[titleKey] || item.media.titleEn || '',
                "Type": item.media.type === 'tv' ? 'TV Series' : 'Movie',
                "Genres": genres,
                "TMDB Rating": item.media.tmdbRating || 0,
                "My Rating": item.userRating || "",
                "Release Date": item.media.releaseDate ? item.media.releaseDate.toISOString().split('T')[0] : '',
                "Watched Date": item.watchedDate ? item.watchedDate.toISOString().split('T')[0] : '',
                "Is Watched": item.isWatched ? 'Yes' : 'No',
                "Is Wishlist": item.isWishlist ? 'Yes' : 'No',
                "Is Favorite": item.isFavorite ? 'Yes' : 'No',
                "Comment": item.userComment || ""
            };
        });

        return {
            success: true,
            data: mappedResults,
        };

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Library Export Error:", errorMessage);

        return { success: false, error: 'Failed to export library' };
    }
}
