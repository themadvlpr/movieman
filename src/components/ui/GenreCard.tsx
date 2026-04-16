'use client'

import Image from "next/image";

interface Genre {
    id: number;
    name: string;
    backdrop_path: string | null;
}

interface GenreCardProps {
    genreId: number;
    genreName: string;
    genreBackDrop: string | null;
    onClick: (id: number) => void;
    idx: number;
}

export default function GenreCard({ genreId, genreName, genreBackDrop, onClick, idx }: GenreCardProps) {
    return (
        <button
            onClick={() => onClick(genreId)}
            className="group relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer"
            style={{
                animation: `fadeInUp 0.6s ease-out ${idx * 0.05}s both`,
            }}
        >
            {/* Backdrop Image */}
            {genreBackDrop ? (
                <Image
                    src={genreBackDrop}
                    alt={genreName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                />
            ) : (
                <div className="absolute inset-0 bg-linear-to-br from-zinc-800 to-zinc-900" />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-2xl">
                    {genreName}
                </h3>
                <div className="h-1 w-0 group-hover:w-12 bg-white transition-all duration-500 rounded-full" />
            </div>

            {/* Glass Highlight */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500" />
        </button>
    )
}
