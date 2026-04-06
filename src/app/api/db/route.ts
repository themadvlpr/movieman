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


import { toggleMediaStatusAction } from "@/lib/actions/toggleMediaStatus";

export async function PATCH(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { mediaId, type, action, mediaData } = body;
        
        await toggleMediaStatusAction(Number(mediaId), action, type, mediaData);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API_DB_PATCH_ERROR:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}