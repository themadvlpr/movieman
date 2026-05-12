'use client'

import { motion } from "framer-motion"

export default function GenreCardSkeleton() {
    return (
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
            <Shimmer />
            {/* Content Placeholder */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 space-y-3">
                <div className="w-1/2 h-6 sm:h-8 bg-white/10 rounded-lg relative overflow-hidden">
                    <Shimmer />
                </div>
                <div className="w-12 h-1 bg-white/10 rounded-full" />
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
