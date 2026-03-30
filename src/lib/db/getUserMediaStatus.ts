import prisma from "@/lib/prisma";

export async function getUserMediaStatus(userId: string | undefined, movieIds: number[], type: "movie" | "tv") {
    if (!userId || movieIds.length === 0) return {};

    try {
        const dbEntries = await prisma.userMedia.findMany({
            where: {
                userId,
                mediaId: { in: movieIds },
                type
            },
            select: {
                mediaId: true,
                isWatched: true,
                isWishlist: true,
                isFavorite: true,
            }
        });

        return dbEntries.reduce((acc, entry) => {
            acc[entry.mediaId] = entry;
            return acc;
        }, {} as Record<number, typeof dbEntries[number]>);

    } catch (error) {
        console.error("Error fetching user media status:", error);
        return {};
    }
}