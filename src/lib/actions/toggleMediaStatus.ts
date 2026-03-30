'use server'

import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-sessions";
import { revalidatePath } from "next/cache";
import { dbState } from "../tmdb/types/db-types";

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
            }
        });
    } else {
        await prisma.userMedia.update({
            where: { id: existing.id },
            data: { [action]: !existing[action as keyof typeof existing] }
        });
    }

    revalidatePath("/");
}