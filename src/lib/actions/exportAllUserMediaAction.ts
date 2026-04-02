'use server'

import prisma from "@/lib/prisma";

export async function exportAllUserMediaAction(userId: string) {
    if (!userId) return { success: false, error: 'Unauthorized' };

    try {
        const userMediaList = await prisma.userMedia.findMany({
            where: { userId },
            orderBy: {
                title: 'asc',
            }
        });

        const mappedResults = userMediaList.map(item => ({
            "Title": item.title,
            "Type": item.type === 'tv' ? 'TV Series' : 'Movie',
            "TMDB Rating": item.rating || 0,
            "My Rating": item.userRating || "",
            "Release Date": item.year ? item.year.toISOString().split('T')[0] : '',
            "Watched Date": item.watchedDate ? item.watchedDate.toISOString().split('T')[0] : '',
            "Is Watched": item.isWatched ? 'Yes' : 'No',
            "Is Wishlist": item.isWishlist ? 'Yes' : 'No',
            "Is Favorite": item.isFavorite ? 'Yes' : 'No',
            "Comment": item.userComment || ""
        }));

        return {
            success: true,
            data: mappedResults,
        };

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Library Export Error:", errorMessage);

        return { success: false, error: 'Failed to export library' };
    }
}
