'use server'

import { getAuthSession } from "@/lib/auth-sessions";
import { revalidatePath } from "next/cache";
import { dbState } from "../tmdb/types/db-types";
import { toggleMediaStatus } from "@/lib/db/media";

export async function toggleMediaStatusAction(
    mediaId: number,
    action: string, // 'isWatched' | 'isFavorite' | 'isWishlist'
    type: string,
    _mediaData: dbState
) {
    const session = await getAuthSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    await toggleMediaStatus(userId, mediaId, action, type);

    revalidatePath("/library");
    revalidatePath("/movies");
    revalidatePath("/tvseries");
    revalidatePath(`/${type === 'movie' ? 'movies' : 'tvseries'}/${mediaId}`);
}