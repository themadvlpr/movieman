'use server'

import prisma from "@/lib/prisma";
import { Prisma } from "../generated/prisma/client";

// Определяем интерфейс для возвращаемого элемента (маппинг)
export interface LibraryResult {
    id: number;
    media_type: string;
    title: string;
    poster_path: string | null;
    vote_average: number;
    release_date: string;
    overview: string | null;
    user_rating: number | null;
    watched_date: string | null;
    initialDbState: {
        isWatched: boolean;
        isFavorite: boolean;
        isWishlist: boolean;
    }
}

export async function getLibraryAction(
    userId: string,
    category: 'watched' | 'wishlist' | 'favorite',
    mediaType: 'all' | 'movie' | 'tv',
    sortBy: 'title' | 'watchedDate' | 'year' | 'userRating' | 'rating',
    sortOrder: 'asc' | 'desc',
    pageParam: string
) {
    if (!userId) return { success: false, error: 'Unauthorized' };

    const page = parseInt(pageParam, 10) || 1;
    const pageSize = 20;

    // Используем сгенерированный тип Prisma для условий поиска
    const whereClause: Prisma.UserMediaWhereInput = {
        userId: userId,
    };

    if (category === 'watched') whereClause.isWatched = true;
    if (category === 'wishlist') whereClause.isWishlist = true;
    if (category === 'favorite') whereClause.isFavorite = true;

    if (mediaType !== 'all') {
        whereClause.type = mediaType;
    }

    // Используем тип для сортировки
    // Сортировка с nulls: 'last' требует специфического синтаксиса Prisma.OrderByWithRelationInput
    let orderByClause: Prisma.UserMediaOrderByWithRelationInput;

    if (sortBy === 'title') {
        orderByClause = { title: sortOrder };
    } else {
        // Для полей, которые могут быть null
        orderByClause = { [sortBy]: { sort: sortOrder, nulls: 'last' } };
    }

    try {
        const [totalCount, watchedMoviesCount, watchedTvCount, userMediaList] = await Promise.all([
            prisma.userMedia.count({ where: whereClause }),
            prisma.userMedia.count({ where: { userId, type: 'movie', isWatched: true } }),
            prisma.userMedia.count({ where: { userId, type: 'tv', isWatched: true } }),
            prisma.userMedia.findMany({
                where: whereClause,
                orderBy: orderByClause,
                skip: (page - 1) * pageSize,
                take: pageSize,
            })
        ]);

        const mappedResults: LibraryResult[] = userMediaList.map(item => ({
            id: item.mediaId,
            media_type: item.type,
            title: item.title,
            poster_path: item.poster,
            vote_average: Number(item.rating) || 0,
            release_date: item.year ? item.year.toISOString().split('T')[0] : '',
            overview: item.description,
            user_rating: item.userRating ? Number(item.userRating) : null,
            watched_date: item.watchedDate ? item.watchedDate.toISOString() : null,
            initialDbState: {
                isWatched: item.isWatched,
                isFavorite: item.isFavorite,
                isWishlist: item.isWishlist,
            }
        }));

        return {
            success: true,
            data: {
                page,
                results: mappedResults,
                total_pages: Math.ceil(totalCount / pageSize) || 1,
                total_results: totalCount,
                watchedMoviesCount,
                watchedTvCount
            }
        };

    } catch (error: unknown) {
        console.error("Library Fetch Error:", error instanceof Error ? error.message : error);
        return { success: false, error: 'Failed to fetch library' };
    }
}