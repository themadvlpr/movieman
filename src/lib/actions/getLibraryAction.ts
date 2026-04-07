'use server'

import prisma from "@/lib/prisma";
import { Prisma } from "../generated/prisma/client";
import { LibraryResult } from "../tmdb/types/tmdb-types";



export async function getLibraryAction(
    userId: string,
    category: 'watched' | 'wishlist' | 'favorite',
    mediaType: 'all' | 'movie' | 'tv',
    sortBy: 'title' | 'watchedDate' | 'year' | 'userRating' | 'rating',
    sortOrder: 'asc' | 'desc',
    pageParam: string,
    tmdbLang: string = 'en-US',
    genreId?: number | null,
    year?: string | null
) {
    if (!userId) return { success: false, error: 'Unauthorized' };

    const page = parseInt(pageParam, 10) || 1;
    const pageSize = 20;

    const whereClause: Prisma.UserMediaWhereInput = {
        userId: userId,
    };

    if (category === 'watched') whereClause.isWatched = true;
    if (category === 'wishlist') whereClause.isWishlist = true;
    if (category === 'favorite') whereClause.isFavorite = true;

    if (mediaType !== 'all') {
        whereClause.type = mediaType;
    }

    if (genreId) {
        whereClause.genreIds = { contains: genreId.toString() };
    }

    if (year && year !== 'all') {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);
        whereClause.releaseDate = {
            gte: startDate,
            lte: endDate
        };
    }

    // Map TMDB locale to column names
    let titleKey: 'titleEn' | 'titleRu' | 'titleUk' = 'titleEn';
    let posterKey: 'posterEn' | 'posterRu' | 'posterUk' = 'posterEn';
    
    if (tmdbLang === 'ru-RU') { titleKey = 'titleRu'; posterKey = 'posterRu'; }
    if (tmdbLang === 'uk-UA') { titleKey = 'titleUk'; posterKey = 'posterUk'; }

    let orderByClause: Prisma.UserMediaOrderByWithRelationInput | undefined;

    if (sortBy === 'title') {
        orderByClause = { [titleKey]: sortOrder };
    } else if (sortBy === 'rating') {
        orderByClause = { tmdbRating: { sort: sortOrder, nulls: 'last' } };
    } else if (sortBy === 'year') {
        orderByClause = { releaseDate: { sort: sortOrder, nulls: 'last' } };
    } else {
        orderByClause = { [sortBy]: { sort: sortOrder, nulls: 'last' } };
    }

    const genreYearFilter: Prisma.UserMediaWhereInput = {};
    if (genreId) {
        genreYearFilter.genreIds = { contains: genreId.toString() };
    }
    if (year && year !== 'all') {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);
        genreYearFilter.releaseDate = {
            gte: startDate,
            lte: endDate
        };
    }

    try {
        const [totalCount, wishlListMoviesCount, wishlListTvCount, favoriteMoviesCount, favoriteTvCount, watchedMoviesCount, watchedTvCount, userMediaList] = await Promise.all([
            prisma.userMedia.count({ where: whereClause }),
            prisma.userMedia.count({ where: { userId, type: 'movie', isWishlist: true, ...genreYearFilter } }),
            prisma.userMedia.count({ where: { userId, type: 'tv', isWishlist: true, ...genreYearFilter } }),
            prisma.userMedia.count({ where: { userId, type: 'movie', isFavorite: true, ...genreYearFilter } }),
            prisma.userMedia.count({ where: { userId, type: 'tv', isFavorite: true, ...genreYearFilter } }),
            prisma.userMedia.count({ where: { userId, type: 'movie', isWatched: true, ...genreYearFilter } }),
            prisma.userMedia.count({ where: { userId, type: 'tv', isWatched: true, ...genreYearFilter } }),
            prisma.userMedia.findMany({
                where: whereClause,
                orderBy: orderByClause,
                skip: (page - 1) * pageSize,
                take: pageSize,
            })
        ]);

        const mappedResults: LibraryResult[] = userMediaList.map(item => ({
            id: item.mediaId,
            media_type: item.type as 'movie' | 'tv',
            title: item[titleKey] || item.titleEn || '',
            poster_path: item[posterKey] || item.posterEn || null,
            vote_average: Number(item.tmdbRating) || 0,
            release_date: item.releaseDate ? item.releaseDate.toISOString().split('T')[0] : '',
            overview: item.userDescription || '',
            genre_ids: item.genreIds ? item.genreIds.split(',').map(Number) : [],
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
                watchedTvCount,
                wishlListMoviesCount,
                wishlListTvCount,
                favoriteMoviesCount,
                favoriteTvCount,
            }
        };

    } catch (error: unknown) {
        console.error("Library Fetch Error:", error instanceof Error ? error.message : error);
        return { success: false, error: 'Failed to fetch library' };
    }
}