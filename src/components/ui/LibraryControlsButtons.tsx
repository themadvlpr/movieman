'use client'

import { Bookmark, Eye, Heart, Plus } from "lucide-react"
import { authClient } from "@/lib/auth-client"


export default function LibraryControlsButtons() {

    const { data: session, isPending } = authClient.useSession()

    if (isPending) {
        return <p>Loading...</p>
    }

    if (!session?.user) {
        return null
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            <button
                aria-label="Add to Watched"
                className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 border border-white/5 hover:border-white/20 backdrop-blur-md transition-all active:scale-90 cursor-pointer group"
            >
                <Eye className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:fill-zinc-300 group-active:fill-zinc-50" />
            </button>
            <button
                aria-label="Add to Wishlist"
                className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 border border-white/5 hover:border-white/20 backdrop-blur-md transition-all active:scale-90 cursor-pointer group"
            >
                <Plus className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:fill-zinc-300 group-active:fill-zinc-50" />
            </button>
            <button
                aria-label="Add to Favorites"
                className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 border border-white/5 hover:border-white/20 backdrop-blur-md transition-all active:scale-90 cursor-pointer group"
            >
                <Heart className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:fill-zinc-300 group-active:fill-zinc-50" />
            </button>
            <button
                aria-label="Add to Favorites"
                className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 border border-white/5 hover:border-white/20 backdrop-blur-md transition-all active:scale-90 cursor-pointer group"
            >
                <Bookmark className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:fill-zinc-300 group-active:fill-zinc-50" />
            </button>
        </div>
    )
}