'use client'

import { motion } from "framer-motion"

export default function MediaDetailSkeleton() {
    return (
        <div className="flex-1 relative bg-black text-white min-h-screen">
            {/* Backdrop Placeholder */}
            <div className="absolute inset-0 h-[40vh] lg:h-screen w-full overflow-hidden pointer-events-none bg-zinc-900">
                <Shimmer />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 pt-[25vh] lg:pt-[65vh] pb-20 px-4 sm:px-8 md:px-12 lg:px-20 mx-auto">
                <div className="flex flex-col gap-8 lg:gap-16">
                    <div className="max-w-3xl flex flex-col gap-8 flex-1">
                        {/* Title Placeholder */}
                        <div className="space-y-6">
                            <div className="w-full sm:w-[80%] h-12 sm:h-20 bg-white/10 rounded-xl relative overflow-hidden">
                                <Shimmer />
                            </div>

                            {/* Metadata row */}
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="w-20 h-5 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                                <div className="w-2 h-5 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                                <div className="w-32 h-5 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                            </div>

                            {/* Genres */}
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-16 h-6 bg-white/5 border border-white/10 rounded-lg relative overflow-hidden">
                                        <Shimmer />
                                    </div>
                                ))}
                            </div>

                            {/* Tagline */}
                            <div className="w-2/3 h-6 bg-white/5 rounded italic relative overflow-hidden">
                                <Shimmer />
                            </div>

                            {/* Overview */}
                            <div className="space-y-3 max-w-4xl">
                                <div className="w-full h-4 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                                <div className="w-full h-4 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                                <div className="w-3/4 h-4 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                            </div>
                        </div>

                        {/* Button Placeholders */}
                        <div className="flex flex-wrap gap-4">
                            <div className="w-40 h-12 bg-white/10 rounded-xl relative overflow-hidden"><Shimmer /></div>
                            <div className="w-12 h-12 bg-white/10 rounded-xl relative overflow-hidden"><Shimmer /></div>
                            <div className="w-12 h-12 bg-white/10 rounded-xl relative overflow-hidden"><Shimmer /></div>
                        </div>
                    </div>
                </div>

                <hr className="border-white/10 my-12" />

                {/* Carousel Placeholder */}
                <div className="space-y-6">
                    <div className="w-32 h-8 bg-white/5 rounded-lg relative overflow-hidden"><Shimmer /></div>
                    <div className="flex gap-4 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="min-w-[120px] sm:min-w-[150px] aspect-[2/3] bg-white/5 rounded-xl relative overflow-hidden">
                                <Shimmer />
                            </div>
                        ))}
                    </div>
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
