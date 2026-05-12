'use client'

import { motion } from "framer-motion"
import MediaCardSkeleton from "./MediaCardSkeleton"

export default function MediaPageSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
    return (
        <div className="pt-20 min-h-screen bg-black">
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-2">
                {/* Header Placeholder */}
                <div className="w-64 sm:w-96 h-10 sm:h-14 bg-white/5 rounded-lg mb-5 relative overflow-hidden">
                    <Shimmer />
                </div>

                {/* Filters & Toggles Placeholder */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-15">
                    <div className="flex items-center gap-1 w-fit bg-white/5 border border-white/10 rounded-xl p-1">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-20 sm:w-24 h-8 sm:h-9 bg-white/5 rounded-lg relative overflow-hidden">
                                <Shimmer />
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                        <div className="w-8 h-8 rounded-lg bg-white/5 relative overflow-hidden"><Shimmer /></div>
                        <div className="w-8 h-8 rounded-lg bg-white/5 relative overflow-hidden"><Shimmer /></div>
                    </div>
                </div>

                {/* Grid of Card Skeletons */}
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
