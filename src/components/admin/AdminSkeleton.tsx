'use client'

import { motion } from "framer-motion"

export default function AdminSkeleton() {
    return (
        <div className="w-full px-4 py-20">
            {/* Title Placeholder */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-8 bg-white/20 rounded-full" />
                <div className="w-48 h-10 bg-white/5 rounded-lg relative overflow-hidden">
                    <Shimmer />
                </div>
            </div>

            {/* Tabs Placeholder */}
            <div className="flex gap-4 mb-8 bg-zinc-900/50 p-1 rounded-xl w-fit border border-white/5">
                <div className="w-32 h-11 bg-white/5 rounded-lg relative overflow-hidden"><Shimmer /></div>
                <div className="w-32 h-11 bg-white/5 rounded-lg relative overflow-hidden"><Shimmer /></div>
            </div>

            {/* Table Placeholder */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 p-6 border-b border-white/5">
                    {[...Array(5)].map(i => (
                        <div key={i} className="h-4 bg-white/10 rounded w-24 relative overflow-hidden"><Shimmer /></div>
                    ))}
                </div>
                {/* Table Rows */}
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="grid grid-cols-5 gap-4 p-6 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 shrink-0 relative overflow-hidden"><Shimmer /></div>
                            <div className="h-4 bg-white/5 rounded w-full relative overflow-hidden"><Shimmer /></div>
                        </div>
                        <div className="flex items-center"><div className="h-4 bg-white/5 rounded w-32 relative overflow-hidden"><Shimmer /></div></div>
                        <div className="flex items-center"><div className="h-4 bg-white/5 rounded w-20 relative overflow-hidden"><Shimmer /></div></div>
                        <div className="flex items-center"><div className="h-4 bg-white/5 rounded w-24 relative overflow-hidden"><Shimmer /></div></div>
                        <div className="flex items-center justify-end"><div className="w-10 h-10 bg-white/5 rounded-lg relative overflow-hidden"><Shimmer /></div></div>
                    </div>
                ))}
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
