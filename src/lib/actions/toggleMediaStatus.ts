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

    const existing = await prisma.userMedia.findUnique({
        where: {
            userId_mediaId_type: { userId, mediaId, type }
        }
    });

    const newStatus = existing ? !existing[action as keyof typeof existing] : true;

    // Fetch TMDB data for ALL supported languages concurrently to populate translations
    const tmdbLocales = Object.values(TMDB_LANGUAGES); // ['en-US', 'ru-RU', 'uk-UA']
    const endpoint = type === 'movie' ? `/movie/${mediaId}` : `/tv/${mediaId}`;

    const tmdbResponses = await Promise.allSettled(
        tmdbLocales.map((lang) => tmdbFetch(endpoint, { language: lang }, CacheConfig.DETAILS))
    );

    // Grab the English (or first successful) result for base numeric data
    const baseDataQuery = tmdbResponses.find(r => r.status === 'fulfilled' && r.value) as PromiseFulfilledResult<any> | undefined;
    const baseTmdbData = baseDataQuery?.value;

    let finalYear = mediaData.year ? new Date(mediaData.year) : null;
    let finalReleaseYear = finalYear ? finalYear.getFullYear() : null;
    let finalRating = mediaData.rating || 0;
    let finalDescription = mediaData.description || null;

    if (baseTmdbData) {
        const rawDate = type === 'movie' ? baseTmdbData.release_date : baseTmdbData.first_air_date;
        if (rawDate) {
            finalYear = new Date(rawDate);
            finalReleaseYear = finalYear.getFullYear();
        }
        finalRating = baseTmdbData.vote_average || finalRating;
        finalDescription = baseTmdbData.overview || finalDescription;
    }

    // Upsert the main UserMedia document
    const userMedia = await prisma.userMedia.upsert({
        where: {
            userId_mediaId_type: { userId, mediaId, type }
        },
        create: {
            userId,
            mediaId,
            type,
            [action]: newStatus,
            tmdbRating: finalRating,
            year: finalYear,
            releaseYear: finalReleaseYear,
            description: finalDescription,
            ...(action === 'isWatched' && { watchedDate: new Date() })
        },
        update: {
            [action]: newStatus,
            tmdbRating: finalRating,
            year: finalYear,
            releaseYear: finalReleaseYear,
            description: finalDescription,
            ...(action === 'isWatched' && { watchedDate: newStatus ? new Date() : null })
        }
    });

    // Populate translations
    const translationPromises = tmdbLocales.map((lang, idx) => {
        const res = tmdbResponses[idx];
        if (res.status === 'fulfilled' && res.value) {
            const data = res.value;
            const localizedTitle = type === 'movie' ? data.title : data.name;
            const localizedPoster = data.poster_path;

            return prisma.mediaTranslation.upsert({
                where: {
                    userMediaId_language: {
                        userMediaId: userMedia.id,
                        language: lang
                    }
                },
                create: {
                    userMediaId: userMedia.id,
                    language: lang,
                    title: localizedTitle || mediaData.title || '',
                    posterPath: localizedPoster
                },
                update: {
                    title: localizedTitle || mediaData.title || '',
                    posterPath: localizedPoster
                }
            });
        }
        return Promise.resolve();
    });

    await Promise.all(translationPromises);
    revalidatePath("/library");
}