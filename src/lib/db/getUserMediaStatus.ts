import prisma from "@/lib/prisma";

export async function getUserMediaStatus(userId: string | undefined, movieIds: number[], type: "movie" | "tv") {
    if (!userId || movieIds.length === 0) return {};

    try {
        const dbEntries = await prisma.userMedia.findMany({
            where: {
                userId,
                media: {
                    tmdbId: { in: movieIds },
                    type
                }
            },
            select: {
                media: {
                    select: { tmdbId: true }
                },
                isWatched: true,
                isWishlist: true,
                isFavorite: true,
                watchedDate: true,
                userRating: true,
                userComment: true,
            }
        });

        const listEntries = await prisma.userListItem.findMany({
            where: {
                list: { userId },
                media: {
                    tmdbId: { in: movieIds },
                    type
                }
            },
            select: {
                listId: true,
                media: {
                    select: { tmdbId: true }
                }
            }
        });

        const listIdsMap = listEntries.reduce((acc, entry) => {
            const tmdbId = entry.media.tmdbId;
            if (!acc[tmdbId]) acc[tmdbId] = [];
            acc[tmdbId].push(entry.listId);
            return acc;
        }, {} as Record<number, string[]>);

        return movieIds.reduce((acc, movieId) => {
            const entry = dbEntries.find(e => e.media.tmdbId === movieId);
            acc[movieId] = {
                ...(entry || {
                    isWatched: false,
                    isWishlist: false,
                    isFavorite: false,
                }),
                listIds: listIdsMap[movieId] || []
            };
            return acc;
        }, {} as Record<number, any>);

    } catch (error) {
        console.error("Error fetching user media status:", error);
        return {};
    }
}