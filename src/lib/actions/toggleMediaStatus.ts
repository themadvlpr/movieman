'use server'

import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-sessions";
import { revalidatePath } from "next/cache";
import { dbState } from "../tmdb/types/db-types";
import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { TMDB_LANGUAGES } from "@/lib/i18n/languageconfig";

export async function toggleMediaStatusAction(
    mediaId: number,
    action: string, // 'isWatched' | 'isFavorite' | 'isWishlist'
    type: string,
    mediaData: dbState
) {
    const session = await getAuthSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    const existing = await prisma.userMedia.findFirst({
        where: {
            userId,
            media: {
                tmdbId: mediaId,
                type: type
            }
        }
    });

    const newStatus = existing ? !existing[action as keyof typeof existing] : true;

    // Fetch TMDB data for ALL supported languages concurrently...
    // ... (rest of the fetching logic stays same until the DB operations) ...
    const tmdbLocales = Object.values(TMDB_LANGUAGES); // ['en-US', 'ru-RU', 'uk-UA']
    const endpoint = type === 'movie' ? `/movie/${mediaId}` : `/tv/${mediaId}`;

    const tmdbResponses = await Promise.allSettled(
        tmdbLocales.map((lang) => tmdbFetch(endpoint, { language: lang }, CacheConfig.DETAILS))
    );

    const baseDataQuery = tmdbResponses.find(r => r.status === 'fulfilled' && r.value) as PromiseFulfilledResult<any> | undefined;
    const baseTmdbData = baseDataQuery?.value;

    let finalReleaseDate = mediaData.releaseDate ? new Date(mediaData.releaseDate) : null;
    let finalRating = mediaData.tmdbRating || 0;
    let finalDescription = mediaData.userDescription || null;
    let finalGenreIds = mediaData.genreIds || null;

    if (baseTmdbData) {
        const rawDate = type === 'movie' ? baseTmdbData.release_date : baseTmdbData.first_air_date;
        if (rawDate) {
            finalReleaseDate = new Date(rawDate);
        }
        finalRating = baseTmdbData.vote_average || finalRating;
        finalDescription = baseTmdbData.overview || finalDescription;
        
        if (baseTmdbData.genre_ids) {
            finalGenreIds = baseTmdbData.genre_ids.join(',');
        } else if (baseTmdbData.genres) {
            finalGenreIds = baseTmdbData.genres.map((g: any) => g.id).join(',');
        }
    }
    
    const getLocalizedTitle = (idx: number) => {
        const res = tmdbResponses[idx];
        if (res?.status === 'fulfilled' && res.value) {
            return type === 'movie' ? res.value.title : res.value.name;
        }
        return null;
    }
    
    const getLocalizedPoster = (idx: number) => {
        const res = tmdbResponses[idx];
        if (res?.status === 'fulfilled' && res.value) {
            return res.value.poster_path;
        }
        return null;
    }

    const titleEn = getLocalizedTitle(0) || mediaData.titleEn || "";
    const titleRu = getLocalizedTitle(1) || mediaData.titleRu || "";
    const titleUk = getLocalizedTitle(2) || mediaData.titleUk || "";
    
    const posterEn = getLocalizedPoster(0) || mediaData.posterEn || null;
    const posterRu = getLocalizedPoster(1) || mediaData.posterRu || null;
    const posterUk = getLocalizedPoster(2) || mediaData.posterUk || null;

    // 1. Upsert the Media record (shared metadata)
    const media = await prisma.media.upsert({
        where: {
            tmdbId_type: { tmdbId: mediaId, type }
        },
        create: {
            tmdbId: mediaId,
            type,
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
        }
    });

    // 2. Upsert the UserMedia record (user-specific status)
    const userMedia = await prisma.userMedia.upsert({
        where: {
            userId_mediaId: { userId, mediaId: media.id }
        },
        create: {
            userId,
            mediaId: media.id,
            [action]: newStatus,
            userDescription: finalDescription,
            ...(action === 'isWatched' && { watchedDate: new Date() })
        },
        update: {
            [action]: newStatus,
            userDescription: finalDescription,
            ...(action === 'isWatched' && { watchedDate: newStatus ? new Date() : null })
        }
    });

    revalidatePath("/library");
    revalidatePath("/movies");
    revalidatePath("/tvseries");
    revalidatePath(`/${type === 'movie' ? 'movies' : 'tvseries'}/${mediaId}`);
}