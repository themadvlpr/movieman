'use client'

import { motion } from "framer-motion"

export default function MainPageSkeleton() {
    return (
        <div className='flex-1 h-full relative flex flex-col justify-end bg-black lg:bg-[#010101] overflow-hidden'>
            {/* Background Skeleton */}
            <div className='absolute inset-x-0 top-0 h-[75dvh] lg:h-full lg:inset-0 bg-black lg:bg-transparent overflow-hidden pointer-events-none'>
                <div className='relative h-full w-full'>
                    <div className="absolute inset-0 bg-zinc-900/20 overflow-hidden">
                        <Shimmer />
                    </div>
                    {/* Optimized Overlay System - matching MainPage.tsx */}
                    <div className='absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/20 lg:from-[#010101] z-10'></div>
                    <div className='absolute inset-0 bg-linear-to-l from-black/60 via-transparent to-transparent lg:via-40% z-10'></div>
                </div>
            </div>

            {/* Content Container - matching MainPage.tsx classes */}
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-16 sm:pt-20 lg:pt-24 pb-4 sm:pb-6 md:pb-8 flex flex-col sm:flex-row items-start sm:items-end justify-end sm:justify-between gap-4 sm:gap-10 mt-auto bg-linear-to-t from-black via-black/90 to-transparent sm:bg-none overflow-hidden">
                
                {/* Left Side: Movie Info */}
                <div className="space-y-3 sm:space-y-5 w-full max-w-2xl">
                    {/* Logo/Title Placeholder */}
                    <div className="mb-3 sm:mb-6 lg:mb-8">
                        <div className="w-64 sm:w-80 md:w-100 h-16 sm:h-24 md:h-32 bg-white/5 rounded-lg relative overflow-hidden">
                            <Shimmer />
                        </div>
                    </div>

                    {/* Meta Info Placeholder */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-16 h-5 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                        <div className="w-px h-4 bg-white/20" />
                        <div className="w-12 h-5 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                        <div className="w-px h-4 bg-white/20" />
                        <div className="w-20 h-5 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                    </div>

                    {/* Tagline Placeholder */}
                    <div className="space-y-2 max-w-xl">
                        <div className="w-full h-4 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                        <div className="w-4/5 h-4 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                    </div>

                    {/* Buttons Placeholder */}
                    <div className="flex flex-wrap flex-col-reverse sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pt-2">
                        <div className="w-36 h-12 bg-white/10 rounded relative overflow-hidden"><Shimmer /></div>
                        <div className="w-44 h-12 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                    </div>
                </div>

                {/* Right Side: Controls & Navigator */}
                <div className="border-t border-zinc-500 sm:border-0 pt-4 flex flex-row sm:flex-col items-center sm:items-end w-full sm:w-auto mt-0 gap-4 sm:gap-6">
                    
                    {/* Genre Dropdown Placeholder (Desktop) */}
                    <div className="relative hidden sm:inline-block mb-2 sm:mb-4">
                        <div className="w-40 h-10 bg-white/10 rounded-lg relative overflow-hidden">
                            <Shimmer />
                        </div>
                    </div>

                    {/* Mobile Controls Placeholder */}
                    <div className="flex sm:hidden items-center justify-between w-full">
                        <div className="w-10 h-10 bg-white/10 rounded-full relative overflow-hidden"><Shimmer /></div>
                        <div className="w-32 h-10 bg-white/10 rounded-xl relative overflow-hidden"><Shimmer /></div>
                        <div className="w-10 h-10 bg-white/10 rounded-full relative overflow-hidden"><Shimmer /></div>
                    </div>

                    {/* Right side navigator placeholder (Desktop) */}
                    <div className="sm:flex hidden flex-col shrink-0 w-56">
                        {/* Counter */}
                        <div className="flex items-baseline gap-2 mb-4">
                            <div className="w-12 h-10 bg-white/10 rounded relative overflow-hidden"><Shimmer /></div>
                            <div className="w-8 h-5 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                        </div>

                        {/* Thin rule */}
                        <div className="w-8 h-px bg-white/20 mb-4" />

                        {/* Title list */}
                        <div className="flex flex-col space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-px h-5 bg-white/10" />
                                    <div 
                                        className="h-4 bg-white/5 rounded relative overflow-hidden"
                                        style={{ width: `${Math.random() * 30 + 60}%` }}
                                    >
                                        <Shimmer />
                                    </div>
                                </div>
                            ))}
                        </div>
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
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
        />
    )
}
