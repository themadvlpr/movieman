import prisma from "@/lib/prisma";

export async function getMediaState(mediaId: number, userId: string, type: string) {
    if (!userId) return null;

    return await prisma.userMedia.findUnique({
        where: {
            userId_mediaId_type: {
                userId,
                mediaId,
                type
            }
        }
    });
}