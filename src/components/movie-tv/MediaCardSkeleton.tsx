'use client'

import { motion } from "framer-motion"

interface MediaCardSkeletonProps {
    viewMode: 'grid' | 'list';
}

export default function MediaCardSkeleton({ viewMode }: MediaCardSkeletonProps) {
    const isGrid = viewMode === 'grid';

    return (
        <div className={`relative transition-all duration-300 ${isGrid
            ? "flex flex-col gap-2 sm:gap-3"
            : "flex flex-row gap-3 sm:p-4 p-3 rounded-xl sm:rounded-2xl bg-white/2 border border-white/5"
            }`}>
            
            {/* POSTER SECTION */}
            <div className={isGrid
                ? "relative aspect-2/3 rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/10"
                : "relative w-25 sm:w-35 aspect-2/3 rounded-lg sm:rounded-xl overflow-hidden shrink-0 bg-zinc-900"
            }>
                <Shimmer />
            </div>

            {/* INFORMATION SECTION */}
            <div className={isGrid ? "px-0.5 space-y-2" : "flex flex-col justify-center gap-2 sm:gap-3 min-w-0 flex-1"}>
                <div className="flex flex-col gap-1.5">
                    {!isGrid && (
                        <div className="w-12 h-3 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                    )}
                    <div className={`${isGrid ? 'w-full h-4' : 'w-2/3 h-6'} bg-white/10 rounded relative overflow-hidden`}>
                        <Shimmer />
                    </div>
                </div>

                {/* META DATA */}
                <div className={`flex flex-wrap gap-2 sm:gap-3 mt-1 ${isGrid ? 'flex-row items-center' : 'flex-col justify-start'}`}>
                    <div className="w-10 h-3 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                    {!isGrid && <div className="w-20 h-3 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>}
                </div>

                {!isGrid && (
                    <div className="space-y-2 mt-2 hidden md:block">
                        <div className="w-full h-3 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                        <div className="w-4/5 h-3 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                    </div>
                )}
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
