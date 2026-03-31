'use client'

import { Bookmark, Eye, Heart } from "lucide-react"
import { useMediaActions } from "@/hooks/useDbStates"
import { dbState, dbMediaStatus } from "@/lib/tmdb/types/db-types"

interface LibraryControlsButtonsProps {
    mediaId: number;
    mediaData: dbState;
    initialState: dbMediaStatus;
    type: "movie" | "tv";
    detailPage?: boolean;
    userId?: string;
}

export default function LibraryControlsButtons({
    mediaId,
    mediaData,
    type,
    initialState,
    detailPage = true,
    userId = ""
}: LibraryControlsButtonsProps) {

    if (!userId) return null;

    const { dbState, toggleAction } = useMediaActions(mediaId, userId, type, initialState);

    const hideWatched = mediaData.year > new Date().toISOString().split('T')[0];

    const states = {
        watched: !!dbState?.isWatched,
        wishlist: !!dbState?.isWishlist,
        favorite: !!dbState?.isFavorite,
    };

    const getButtonClass = (isActive: boolean) => {
        const baseClass = "p-2 rounded-sm border backdrop-blur-md transition-all active:scale-90 cursor-pointer group"

        return isActive
            ? `${baseClass} bg-white text-zinc-950 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]`
            : `${baseClass} bg-white/10 text-zinc-200 border-white/10 hover:bg-white/20 hover:text-white hover:border-white/30`;
    };

    const iconClass = "w-4 h-4";

    return (
        <div className={`flex items-center gap-1.5 lg:gap-3`}>
            {!hideWatched && (
                detailPage ? <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleAction('isWatched', mediaData) }}
                    className={`flex items-center gap-2.5 px-6 py-2.75 rounded-md font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 cursor-pointer 
								${states.watched ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                >
                    <Eye strokeWidth={3} className={`w-3.5 h-3.5 ${states.watched ? 'fill-black' : ''}`} />
                    {states.watched ? 'Watched' : 'Mark as Watched'}
                </button> :
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleAction('isWatched', mediaData) }}
                        className={getButtonClass(states.watched)}
                    >
                        <Eye className={`${iconClass} ${states.watched ? 'fill-zinc-950' : ''}`} strokeWidth={2.5} />
                    </button>
            )}
            <button
                type="button"
                onClick={() => toggleAction('isFavorite', mediaData)}
                className={getButtonClass(states.favorite)}
            >
                <Heart className={`${iconClass} ${states.favorite ? 'fill-zinc-950' : ''}`} strokeWidth={2.5} />
            </button>
            <button
                type="button"
                onClick={() => toggleAction('isWishlist', mediaData)}
                className={getButtonClass(states.wishlist)}
            >
                <Bookmark className={`${iconClass} ${states.wishlist ? 'fill-zinc-950' : ''}`} strokeWidth={2.5} />
            </button>
        </div>
    );
}