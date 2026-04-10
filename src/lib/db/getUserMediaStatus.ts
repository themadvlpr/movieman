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

        return dbEntries.reduce((acc, entry) => {
            const externalId = entry.media.tmdbId;
            acc[externalId] = entry;
            return acc;
        }, {} as Record<number, any>);

    } catch (error) {
        console.error("Error fetching user media status:", error);
        return {};
    }
}