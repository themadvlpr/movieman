'use server'

import prisma from "@/lib/prisma";
import { Prisma } from "../generated/prisma/client";
import { LibraryResult } from "../tmdb/types/tmdb-types";



export async function getLibraryAction(
    userId: string,
    category: 'watched' | 'wishlist' | 'favorite' | string,
    mediaType: 'all' | 'movie' | 'tv',
    sortBy: 'title' | 'watchedDate' | 'year' | 'userRating' | 'rating',
    sortOrder: 'asc' | 'desc',
    pageParam: string,
    tmdbLang: string = 'en-US',
    genreId?: number | null,
    year?: string | null,
    viewerUserId?: string
) {
    if (!userId) return { success: false, error: 'Unauthorized' };

    const page = parseInt(pageParam, 10) || 1;
    const pageSize = 48;

    const whereClause: Prisma.UserMediaWhereInput = {
        userId: userId,
    };

    const isCustomList = category.startsWith('list_');
    const listId = isCustomList ? category.replace('list_', '') : null;

    if (category === 'watched') whereClause.isWatched = true;
    else if (category === 'wishlist') whereClause.isWishlist = true;
    else if (category === 'favorite') whereClause.isFavorite = true;
    else if (isCustomList && listId) {
        whereClause.media = {
             listItems: { some: { listId } }
        };
    }

    if (mediaType !== 'all' || genreId || (year && year !== 'all')) {
        const mediaFilter: any = { ...((whereClause.media as any) || {}) };
        if (mediaType !== 'all') mediaFilter.type = mediaType;
        if (genreId) mediaFilter.genreIds = { contains: genreId.toString() };
        if (year && year !== 'all') {
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year}-12-31`);
            mediaFilter.releaseDate = {
                gte: startDate,
                lte: endDate
            };
        }
        whereClause.media = mediaFilter;
    }

    // Map TMDB locale to column names
    let titleKey: 'titleEn' | 'titleRu' | 'titleUk' = 'titleEn';
    let posterKey: 'posterEn' | 'posterRu' | 'posterUk' = 'posterEn';

    if (tmdbLang === 'ru-RU') { titleKey = 'titleRu'; posterKey = 'posterRu'; }
    if (tmdbLang === 'uk-UA') { titleKey = 'titleUk'; posterKey = 'posterUk'; }

    let orderByClause: Prisma.UserMediaOrderByWithRelationInput | undefined;

    if (sortBy === 'title') {
        orderByClause = { media: { [titleKey]: sortOrder } };
    } else if (sortBy === 'rating') {
        orderByClause = { media: { tmdbRating: { sort: sortOrder, nulls: 'last' } } };
    } else if (sortBy === 'year') {
        orderByClause = { media: { releaseDate: { sort: sortOrder, nulls: 'last' } } };
    } else {
        orderByClause = { [sortBy]: { sort: sortOrder, nulls: 'last' } };
    }

    const genreYearFilter: any = {};
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
            prisma.userMedia.count({ where: { userId, isWishlist: true, media: { type: 'movie', ...genreYearFilter } } }),
            prisma.userMedia.count({ where: { userId, isWishlist: true, media: { type: 'tv', ...genreYearFilter } } }),
            prisma.userMedia.count({ where: { userId, isFavorite: true, media: { type: 'movie', ...genreYearFilter } } }),
            prisma.userMedia.count({ where: { userId, isFavorite: true, media: { type: 'tv', ...genreYearFilter } } }),
            prisma.userMedia.count({ where: { userId, isWatched: true, media: { type: 'movie', ...genreYearFilter } } }),
            prisma.userMedia.count({ where: { userId, isWatched: true, media: { type: 'tv', ...genreYearFilter } } }),
            prisma.userMedia.findMany({
                where: whereClause,
                orderBy: orderByClause,
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: { 
                    media: {
                        include: {
                            listItems: {
                                where: { list: { userId: viewerUserId || userId } },
                                select: { listId: true }
                            }
                        }
                    } 
                }
            })
        ]);

        let viewerMediaEntries: any[] = [];
        if (viewerUserId && viewerUserId !== userId) {
            const tmdbIds = userMediaList.map(item => item.media.tmdbId);
            viewerMediaEntries = await prisma.userMedia.findMany({
                where: {
                    userId: viewerUserId,
                    media: { tmdbId: { in: tmdbIds } }
                }
            });
        }

        const mappedResults: LibraryResult[] = userMediaList.map(item => {
            const viewerEntry = viewerUserId && viewerUserId !== userId 
                ? viewerMediaEntries.find(ve => ve.userId === viewerUserId && ve.mediaId === item.mediaId)
                : item;

            return {
                id: item.media.tmdbId,
                media_type: item.media.type as 'movie' | 'tv',
                title: (item.media as any)[titleKey] || item.media.titleEn || '',
                poster_path: (item.media as any)[posterKey] || item.media.posterEn || null,
                vote_average: Number(item.media.tmdbRating) || 0,
                release_date: item.media.releaseDate ? item.media.releaseDate.toISOString().split('T')[0] : '',
                genre_ids: item.media.genreIds ? item.media.genreIds.split(',').map(Number) : [],
                // item.userRating is the OWNER's rating
                user_rating: item.userRating ? Number(item.userRating) : null,
                // viewerEntry.userRating is the VIEWER's rating (if viewerEntry exists and is different from item)
                viewer_rating: (viewerUserId && viewerUserId !== userId && viewerEntry) ? (viewerEntry.userRating ? Number(viewerEntry.userRating) : null) : undefined,
                watched_date: viewerEntry?.watchedDate ? viewerEntry.watchedDate.toISOString() : null,
                initialDbState: {
                    isWatched: !!viewerEntry?.isWatched,
                    isFavorite: !!viewerEntry?.isFavorite,
                    isWishlist: !!viewerEntry?.isWishlist,
                    listIds: item.media.listItems.map(li => li.listId)
                }
            };
        });


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