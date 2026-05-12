'use client'

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"

export default function MoviePoster({ src, alt, className, priority }: { src: string | null, alt: string, className?: string, priority?: boolean }) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={`relative w-full h-full bg-zinc-900 overflow-hidden ${className}`}>
            <AnimatePresence>
                {!isLoaded && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 bg-zinc-800"
                    >
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                    </motion.div>
                )}
            </AnimatePresence>

            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    style={priority ? { opacity: 1 } : {}}
                    onLoad={() => setIsLoaded(true)}
                    priority={priority}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                    No Poster
                </div>
            )}
        </div>
    );
}
