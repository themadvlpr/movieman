'use server'

import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-sessions";
import { revalidatePath } from "next/cache";
import { dbState } from "../tmdb/types/db-types";
import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { TMDB_LANGUAGES } from "@/lib/i18n/languageconfig";

export async function getUserListsAction(mediaId?: number) {
    const session = await getAuthSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const lists = await prisma.userList.findMany({
        where: { userId: session.user.id },
        include: {
            items: mediaId ? {
                // Here we match by the actual Media model's tmdbId
                where: { media: { tmdbId: mediaId } },
                select: { id: true }
            } : false
        },
        orderBy: { createdAt: 'desc' }
    });

    return lists.map(list => ({
        id: list.id,
        name: list.name,
        isActive: list.items ? list.items.length > 0 : false
    }));
}

export async function getPublicUserListsAction(userId: string, mediaId?: number) {
    if (!userId) throw new Error("Missing user ID");

    const lists = await prisma.userList.findMany({
        where: { userId },
        include: {
            items: mediaId ? {
                where: { media: { tmdbId: mediaId } },
                select: { id: true }
            } : false
        },
        orderBy: { createdAt: 'desc' }
    });

    return lists.map(list => ({
        id: list.id,
        name: list.name,
        isActive: list.items ? list.items.length > 0 : false
    }));
}

export async function createUserListAction(name: string) {
    const session = await getAuthSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        const newList = await prisma.userList.create({
            data: {
                userId: session.user.id,
                name
            }
        });
        revalidatePath("/library");
        return { success: true, data: { id: newList.id, name: newList.name, isActive: false } };
    } catch (e: any) {
        if (e.code === 'P2002') return { success: false, error: 'List with this name already exists' };
        return { success: false, error: 'Failed to create list' };
    }
}

export async function toggleMediaInListAction(
    listId: string,
    mediaId: number,
    type: string,
    mediaData: dbState
) {
    const session = await getAuthSession();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    // Verify list belongs to user
    const list = await prisma.userList.findUnique({ where: { id: listId } });
    if (!list || list.userId !== userId) throw new Error("List not found");

    const tmdbLocales = Object.values(TMDB_LANGUAGES);
    const endpoint = type === 'movie' ? `/movie/${mediaId}` : `/tv/${mediaId}`;

    const tmdbResponses = await Promise.allSettled(
        tmdbLocales.map((lang) => tmdbFetch(endpoint, { language: lang }, CacheConfig.DETAILS))
    );

    const baseDataQuery = tmdbResponses.find(r => r.status === 'fulfilled' && r.value) as PromiseFulfilledResult<any> | undefined;
    const baseTmdbData = baseDataQuery?.value;

    let finalReleaseDate = mediaData.releaseDate ? new Date(mediaData.releaseDate) : null;
    let finalRating = mediaData.tmdbRating || 0;
    let finalGenreIds = mediaData.genreIds || null;

    if (baseTmdbData) {
        const rawDate = type === 'movie' ? baseTmdbData.release_date : baseTmdbData.first_air_date;
        if (rawDate) {
            finalReleaseDate = new Date(rawDate);
        }
        finalRating = baseTmdbData.vote_average || finalRating;

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

    // 1. Upsert the Media record
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

    // Ensure UserMedia exists
    await prisma.userMedia.upsert({
        where: { userId_mediaId: { userId, mediaId: media.id } },
        create: { userId, mediaId: media.id },
        update: {}
    });

    // 2. Add or Remove from list
    const existing = await prisma.userListItem.findUnique({
        where: {
            listId_mediaId: { listId, mediaId: media.id }
        }
    });

    if (existing) {
        await prisma.userListItem.delete({
            where: { id: existing.id }
        });
    } else {
        await prisma.userListItem.create({
            data: { listId, mediaId: media.id }
        });
    }

    revalidatePath("/library");
    return { success: true, isNowActive: !existing };
}

export async function renameUserListAction(listId: string, newName: string) {
    const session = await getAuthSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        const updatedList = await prisma.userList.update({
            where: { id: listId, userId: session.user.id },
            data: { name: newName }
        });
        revalidatePath("/library");
        return { success: true, data: { id: updatedList.id, name: updatedList.name } };
    } catch (e: any) {
        if (e.code === 'P2002') return { success: false, error: 'List with this name already exists' };
        return { success: false, error: 'Failed to rename list' };
    }
}

export async function deleteUserListAction(listId: string) {
    const session = await getAuthSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        await prisma.userList.delete({
            where: { id: listId, userId: session.user.id }
        });
        revalidatePath("/library");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: 'Failed to delete list' };
    }
}
