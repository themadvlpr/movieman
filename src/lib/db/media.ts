import prisma from "@/lib/prisma";
import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";

const TMDB_LANGUAGES = ["en-US", "ru-RU", "uk-UA"];

/**
 * Reusable helper to toggle a media status (isWatched, isFavorite, isWishlist)
 * and upsert the media metadata in the DB (with multilingual titles/posters).
 */
export async function toggleMediaStatus(
    userId: string,
    tmdbId: number,
    action: string, // 'isWatched' | 'isFavorite' | 'isWishlist'
    type: string
) {
    // Check current state
    const existing = await prisma.userMedia.findFirst({
        where: {
            userId,
            media: { tmdbId, type }
        }
    });

    const newStatus = existing
        ? !existing[action as keyof typeof existing]
        : true;

    // Fetch TMDB data in all languages
    const endpoint = type === "movie" ? `/movie/${tmdbId}` : `/tv/${tmdbId}`;
    const tmdbResponses = await Promise.allSettled(
        TMDB_LANGUAGES.map((lang) => tmdbFetch(endpoint, { language: lang }, CacheConfig.DETAILS))
    );

    const getVal = (idx: number) => {
        const r = tmdbResponses[idx];
        return r?.status === "fulfilled" && r.value ? r.value : null;
    };

    const enData = getVal(0);
    const ruData = getVal(1);
    const ukData = getVal(2);
    const baseData = enData || ruData || ukData;

    const getTitle = (d: any) => (d ? (type === "movie" ? d.title : d.name) : null);
    const titleEn = getTitle(enData) || "";
    const titleRu = getTitle(ruData) || "";
    const titleUk = getTitle(ukData) || "";
    const posterEn = enData?.poster_path || null;
    const posterRu = ruData?.poster_path || null;
    const posterUk = ukData?.poster_path || null;

    let finalReleaseDate: Date | null = null;
    let finalRating = 0;
    let finalGenreIds: string | null = null;

    if (baseData) {
        const rawDate = type === "movie" ? baseData.release_date : baseData.first_air_date;
        if (rawDate) finalReleaseDate = new Date(rawDate);
        finalRating = baseData.vote_average || 0;
        if (baseData.genres) {
            finalGenreIds = baseData.genres.map((g: any) => g.id).join(",");
        }
    }

    // Upsert Media
    const media = await prisma.media.upsert({
        where: { tmdbId_type: { tmdbId, type } },
        create: {
            tmdbId, type,
            tmdbRating: finalRating,
            releaseDate: finalReleaseDate,
            genreIds: finalGenreIds,
            titleEn, titleRu, titleUk,
            posterEn, posterRu, posterUk,
        },
        update: {
            tmdbRating: finalRating,
            releaseDate: finalReleaseDate,
            genreIds: finalGenreIds,
            titleEn, titleRu, titleUk,
            posterEn, posterRu, posterUk,
        },
    });

    // Upsert UserMedia
    await prisma.userMedia.upsert({
        where: { userId_mediaId: { userId, mediaId: media.id } },
        create: {
            userId,
            mediaId: media.id,
            [action]: newStatus,
            ...(action === "isWatched" && { watchedDate: new Date() }),
        },
        update: {
            [action]: newStatus,
            ...(action === "isWatched" && { watchedDate: newStatus ? new Date() : null }),
        },
    });

    return newStatus;
}
