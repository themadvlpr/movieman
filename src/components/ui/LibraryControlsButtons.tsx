'use client'

import { Bookmark, Eye, Heart } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useMediaActions } from "@/hooks/useMediaStates"

interface LibraryControlsButtonsProps {
    mediaId: number;
    mediaData: {
        title: string;
        poster: string | null;
        rating: number;
        year?: string;
    };
    size?: "sm" | "md";
    hideWatched?: boolean;
    type: "movie" | "tv";
    detailPage?: boolean;
}

export default function LibraryControlsButtons({
    mediaId,
    mediaData,
    size = "md",
    hideWatched = false,
    type,
    detailPage = true
}: LibraryControlsButtonsProps) {
    const { data: session } = authClient.useSession();
    const userId = session?.user?.id;

    const { dbState, toggleAction } = useMediaActions(mediaId, userId, type);

    if (!session) return null;


    const states = {
        watched: !!dbState?.isWatched,
        wishlist: !!dbState?.isWishlist,
        favorite: !!dbState?.isFavorite,
    };

    const getButtonClass = (isActive: boolean) => {
        const baseClass = size === "sm"
            ? "p-1.5 rounded-lg border backdrop-blur-md transition-all active:scale-90 cursor-pointer group"
            : "p-2 rounded-sm border backdrop-blur-md transition-all active:scale-90 cursor-pointer group"

        return isActive
            ? `${baseClass} bg-white text-zinc-950 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]`
            : `${baseClass} bg-white/10 text-zinc-200 border-white/10 hover:bg-white/20 hover:text-white hover:border-white/30`;
    };

    const iconClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";

    return (
        <div className={`flex items-center ${size === "sm" ? "gap-1.5" : "gap-3"}`}>
            {!hideWatched && (
                <button
                    onClick={() => toggleAction('isWatched', mediaData)}
                    className={`flex items-center gap-2.5 px-6 py-2.75 rounded-sm font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 cursor-pointer 
								${states.watched ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                >
                    <Eye strokeWidth={3} className={`w-3.5 h-3.5 ${states.watched ? 'fill-black' : ''}`} />
                    {states.watched ? 'Watched' : 'Mark as Watched'}
                </button>
            )}
            <button
                onClick={() => toggleAction('isFavorite', mediaData)}
                className={getButtonClass(states.favorite)}
            >
                <Heart className={`${iconClass} ${states.favorite ? 'fill-zinc-950' : ''}`} strokeWidth={2.5} />
            </button>
            <button
                onClick={() => toggleAction('isWishlist', mediaData)}
                className={getButtonClass(states.wishlist)}
            >
                <Bookmark className={`${iconClass} ${states.wishlist ? 'fill-zinc-950' : ''}`} strokeWidth={2.5} />
            </button>
        </div>
    );
}