'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface VideoModalProps {
    isOpen: boolean
    onClose: () => void
    videoKey: string | null
}

export default function VideoModal({ isOpen, onClose, videoKey }: VideoModalProps) {
    if (!videoKey) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed text-white z-50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-60 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors border border-white/10 backdrop-blur-md cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0"
                            />
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
