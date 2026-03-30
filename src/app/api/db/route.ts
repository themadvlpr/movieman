import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-sessions";


import { getMediaState } from "@/lib/db/getMedia";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mediaId = Number(searchParams.get("mediaId"));
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") || "movie";

    if (!userId || !mediaId) return new Response("Missing params", { status: 400 });

    const state = await getMediaState(mediaId, userId, type);
    return Response.json(state);
}


export async function PATCH(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { mediaId, type, action, mediaData } = body;
        const userId = session.user.id;

        const record = await prisma.userMedia.findUnique({
            where: {
                userId_mediaId_type: {
                    userId,
                    mediaId: Number(mediaId),
                    type
                }
            }
        });


        const movieYear = mediaData?.year ? new Date(mediaData.year) : null;
        const currentStatus = record ? (record[action as keyof typeof record] as boolean) : false;
        const newStatus = !currentStatus;

        const updated = await prisma.userMedia.upsert({
            where: {
                userId_mediaId_type: {
                    userId,
                    mediaId: Number(mediaId),
                    type
                }
            },
            update: {
                [action]: newStatus,
                ...(action === 'isWatched' && {
                    watchedDate: newStatus ? new Date() : null
                })
            },
            create: {
                userId,
                mediaId: Number(mediaId),
                type,
                title: mediaData?.title || "Unknown",
                poster: mediaData?.poster,
                rating: mediaData?.rating ? Number(mediaData?.rating) : null,
                year: movieYear,
                [action]: true,
                ...(action === 'isWatched' && { watchedDate: new Date() })
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("API_DB_PATCH_ERROR:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}