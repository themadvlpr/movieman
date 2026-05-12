'use client'

import { motion } from "framer-motion"
import MediaCardSkeleton from "../movie-tv/MediaCardSkeleton"

export default function LibraryPageSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
    return (
        <div className="pt-20 min-h-screen">
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-2">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3 sm:gap-6">
                        <div className="w-48 sm:w-64 h-10 sm:h-14 bg-white/5 rounded-lg relative overflow-hidden">
                            <Shimmer />
                        </div>
                    </div>
                    <div className="w-32 h-10 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden">
                        <Shimmer />
                    </div>
                </div>

                {/* Counts Row */}
                <div className="flex items-center gap-2 sm:gap-3 mb-5">
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg w-24 h-8 relative overflow-hidden">
                        <Shimmer />
                    </div>
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg w-24 h-8 relative overflow-hidden">
                        <Shimmer />
                    </div>
                </div>

                {/* Categories & Controls Row */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 md:gap-6 mb-5">
                    {/* Left: Standard Categories & Custom Lists */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* libraries.map (watched, wishlist, favorite) */}
                        <div className="flex items-center gap-1 w-full sm:w-fit bg-white/5 border border-white/10 rounded-xl p-1">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex-1 sm:flex-none w-20 sm:w-28 h-8 sm:h-9 bg-white/5 rounded-lg relative overflow-hidden">
                                    <Shimmer />
                                </div>
                            ))}
                        </div>
                        {/* Custom Lists Select */}
                        <div className="min-w-[140px] h-9 sm:h-11 bg-white/5 border border-white/10 rounded-lg relative overflow-hidden">
                            <Shimmer />
                        </div>
                    </div>

                    {/* Right: Media Type & View Toggles */}
                    <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                        {/* Media Type Filter */}
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-14 h-8 bg-white/5 rounded-lg relative overflow-hidden">
                                    <Shimmer />
                                </div>
                            ))}
                        </div>
                        {/* View Toggles */}
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                            <div className="w-8 h-8 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                            <div className="w-8 h-8 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                        </div>
                    </div>
                </div>

                {/* Sort & Filters Row */}
                <div className="flex gap-3 flex-wrap">
                    {/* Filter Button Group */}
                    <div className="flex flex-col gap-1.5">
                        <div className="w-10 h-3 bg-white/5 rounded ml-1 relative overflow-hidden"><Shimmer /></div>
                        <div className="w-32 h-9 bg-white/5 border border-white/10 rounded-md relative overflow-hidden"><Shimmer /></div>
                    </div>
                    {/* Sort Select Group */}
                    <div className="flex flex-col gap-1.5 md:w-fit">
                        <div className="w-14 h-3 bg-white/5 rounded ml-1 relative overflow-hidden"><Shimmer /></div>
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-md p-1 w-48 h-9 relative overflow-hidden">
                            <Shimmer />
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className={viewMode === 'grid' 
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 pb-20 mt-15"
                    : "flex flex-col gap-3 sm:gap-4 pb-20 mt-15"}>
                    {[...Array(12)].map((_, i) => (
                        <MediaCardSkeleton key={i} viewMode={viewMode} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function Shimmer() {
    return (
        <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
            }}
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent"
        />
    )
}
