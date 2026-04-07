'use server'

import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-sessions";
import { revalidatePath } from "next/cache";

export async function updateMediaDetailsAction(
    mediaId: number,
    type: string,
    data: {
        watchedDate?: Date | null;
        userRating?: number | null;
        userComment?: string | null;
    }
) {
    try {
        const session = await getAuthSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const userId = session.user.id;

        const existing = await prisma.userMedia.findUnique({
            where: {
                userId_mediaId_type: { userId, mediaId, type }
            }
        });

        if (existing) {
            await prisma.userMedia.update({
                where: { id: existing.id },
                data: {
                    ...(data.watchedDate !== undefined && { watchedDate: data.watchedDate }),
                    ...(data.userRating !== undefined && { userRating: data.userRating }),
                    ...(data.userComment !== undefined && { userComment: data.userComment }),
                }
            });
            revalidatePath("/library");
            revalidatePath("/movies");
            revalidatePath("/tvseries");
            revalidatePath(`/${type === 'movie' ? 'movies' : 'tvseries'}/${mediaId}`);
            return { success: true, message: "Changes saved" };
        }

        return { success: false, error: "Media not found" };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to update" };
    }
}