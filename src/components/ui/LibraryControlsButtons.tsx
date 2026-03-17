'use client'

import { useState } from "react"
import { Bookmark, Eye, Heart, Plus } from "lucide-react"
import { authClient } from "@/lib/auth-client"


interface LibraryControlsButtonsProps {
    movieId?: number | string;
    size?: "sm" | "md";
}

export default function LibraryControlsButtons({ movieId, size = "md" }: LibraryControlsButtonsProps) {
    const [states, setStates] = useState({
        watched: false,
        wishlist: false,
        favorite: false,
    })

    const { data: session, isPending } = authClient.useSession()

    if (isPending) {
        return null // Return null instead of "Loading..." for smoother UI in cards
    }

    if (!session?.user) {
        return null
    }

    const handleClick = (e: React.MouseEvent, action: keyof typeof states) => {
        e.preventDefault()
        e.stopPropagation()
        setStates(prev => ({ ...prev, [action]: !prev[action] }))
    }

    const getButtonClass = (isActive: boolean) => {
        const baseClass = size === "sm"
            ? "p-1.5 rounded-lg border backdrop-blur-md transition-all active:scale-90 cursor-pointer group"
            : "p-2 rounded-sm border backdrop-blur-md transition-all active:scale-90 cursor-pointer group"

        if (isActive) {
            return `${baseClass} bg-white text-zinc-950 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]`
        }

        return size === "sm"
            ? `${baseClass} bg-black/50 text-zinc-200 border-white/10 hover:bg-black/70 hover:text-white hover:border-white/30`
            : `${baseClass} bg-white/10 text-zinc-200 border-white/10 hover:bg-white/20 hover:text-white hover:border-white/30`
    }

    const iconClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    const strokeWidth = 2.5;

    return (
        <div className={`flex flex-wrap items-center ${size === "sm" ? "gap-1.5" : "gap-3"}`}>
            <button
                onClick={(e) => handleClick(e, 'watched')}
                aria-label="Add to Watched"
                className={getButtonClass(states.watched)}
            >
                <Eye strokeWidth={strokeWidth} className={`${iconClass} transition-transform group-hover:scale-110 ${states.watched ? 'fill-zinc-950' : ''}`} />
            </button>
            <button
                onClick={e => e.preventDefault()}
                aria-label="Add to Wishlist"
                className={getButtonClass(false)}
            >
                <Plus strokeWidth={strokeWidth + 0.5} className={`${iconClass} transition-transform group-hover:scale-110`} />
            </button>
            <button
                onClick={(e) => handleClick(e, 'favorite')}
                aria-label="Add to favorite"
                className={getButtonClass(states.favorite)}
            >
                <Heart strokeWidth={strokeWidth} className={`${iconClass} transition-transform group-hover:scale-110 ${states.favorite ? 'fill-zinc-950' : ''}`} />
            </button>
            <button
                onClick={(e) => handleClick(e, 'wishlist')}
                aria-label="Add to Bookmark"
                className={getButtonClass(states.wishlist)}
            >
                <Bookmark strokeWidth={strokeWidth} className={`${iconClass} transition-transform group-hover:scale-110 ${states.wishlist ? 'fill-zinc-950' : ''}`} />
            </button>
        </div>
    )
}