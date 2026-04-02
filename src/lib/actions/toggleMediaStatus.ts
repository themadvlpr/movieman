'use server'

import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-sessions";
import { revalidatePath } from "next/cache";
import { dbState } from "../tmdb/types/db-types";
import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";

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

    if (!existing) {
        await prisma.userMedia.create({
            data: {
                userId,
                mediaId,
                type,
                [action]: true,
                title: mediaData.title,
                poster: mediaData.poster,
                rating: mediaData.rating,
                year: new Date(mediaData.year),
                description: mediaData.description,
                ...(action === 'isWatched' && { watchedDate: new Date() })
            }
        });
    } else {
        const newStatus = !existing[action as keyof typeof existing];

        // Fetch fresh metadata from TMDB to ensure we have the correct full release date and title
        let updatedData = { ...mediaData };
        try {
            const endpoint = type === 'movie' ? `/movie/${mediaId}` : `/tv/${mediaId}`;
            const tmdbData = await tmdbFetch(endpoint, {}, CacheConfig.DETAILS);
            if (tmdbData) {
                updatedData.year = type === 'movie' ? tmdbData.release_date : tmdbData.first_air_date;
                updatedData.title = type === 'movie' ? tmdbData.title : tmdbData.name;
                updatedData.poster = tmdbData.poster_path;
                updatedData.rating = tmdbData.vote_average;
            }
        } catch (error) {
            console.error("Failed to sync metadata from TMDB:", error);
        }

        await prisma.userMedia.update({
            where: { id: existing.id },
            data: {
                [action]: newStatus,
                description: updatedData.description,
                poster: updatedData.poster,
                year: updatedData.year ? new Date(updatedData.year) : null,
                rating: updatedData.rating,
                title: updatedData.title,
                ...(action === 'isWatched' && { watchedDate: newStatus ? new Date() : null })
            }
        });
    }

    revalidatePath("/");
    revalidatePath("/library");
}