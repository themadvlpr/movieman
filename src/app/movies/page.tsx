'use client'

import { useState } from "react"
import Link from "next/link"
import { Play } from "lucide-react"

const categories = [
    { key: 'popular', label: 'Popular' },
    { key: 'topRated', label: 'Top Rated' },
    { key: 'upcoming', label: 'Upcoming' },
]

const movies = [
    {
        id: 1,
        title: "Hoopers",
        rating: 7.7,
        release_date: "2026-01-01",
        overview: "Scientists have discovered how to 'hop' human consciousness into lifelike robotic animals, allowing people to communicate with animals as animals. Animal lover Mabel seizes an opportunity to use the technology, uncovering mysteries within the animal world beyond anything she could have imagined.",
        poster: 'https://image.tmdb.org/t/p/original/2RrLuIfIzGWWIH8IAEo6o0IYHmx.jpg',
        logo: 'https://image.tmdb.org/t/p/w500/xS2WPzXYUkW9IZwSL56tV74APPm.png'
    },
    {
        id: 2,
        title: "Dune: Part Two",
        rating: 8.3,
        release_date: "2024-02-27",
        overview: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
        poster: "https://image.tmdb.org/t/p/original/ylkdrn23p3gQcHx7ukIfuy2CkTE.jpg",
        logo: "https://image.tmdb.org/t/p/w500/woifx7xduIyJYq8ktCiN36zt9Xu.png"
    },
    {
        id: 3,
        title: "Oppenheimer",
        rating: 8.1,
        release_date: "2023-07-19",
        overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
        poster: "https://image.tmdb.org/t/p/original/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
        logo: 'https://image.tmdb.org/t/p/w500/b07VisHvZb0WzUpA8VB77wfMXwg.png'
    },
    {
        id: 4,
        title: "Scream 7",
        rating: 5.1,
        release_date: "2026-07-19",
        overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
        poster: "https://image.tmdb.org/t/p/original/hz7TdCrpLLt2Dz7S3PS2HG9rpAO.jpg",
        logo: 'https://image.tmdb.org/t/p/w500/2JRh8uPqNGlZC72vJawAGHToOnk.png'
    }
]

const categoryMovies: Record<string, typeof movies> = {
    popular: [
        { id: 1, title: "Dune: Part Two", rating: 8.3, release_date: "2024-02-27", overview: "", poster: "https://image.tmdb.org/t/p/w500/ylkdrn23p3gQcHx7ukIfuy2TE.jpg", logo: "" },
        { id: 2, title: "Oppenheimer", rating: 8.1, release_date: "2023-07-19", overview: "", poster: "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg", logo: "" },
        { id: 3, title: "Hoopers", rating: 7.7, release_date: "2026-01-01", overview: "", poster: "https://image.tmdb.org/t/p/w500/2RrLuIfIzGWWIH8IAEo6o0IYHmx.jpg", logo: "" },
        { id: 4, title: "Scream 7", rating: 5.1, release_date: "2026-07-19", overview: "", poster: "https://image.tmdb.org/t/p/w500/hz7TdCrpLLt2Dz7S3PS2HG9rpAO.jpg", logo: "" },
        { id: 5, title: "Dune: Part Two", rating: 8.3, release_date: "2024-02-27", overview: "", poster: "https://image.tmdb.org/t/p/w500/ylkdrn23p3gQcHx7ukIfuy2TE.jpg", logo: "" },
        { id: 6, title: "Oppenheimer", rating: 8.1, release_date: "2023-07-19", overview: "", poster: "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg", logo: "" },
    ],
    topRated: [
        { id: 1, title: "Oppenheimer", rating: 8.1, release_date: "2023-07-19", overview: "", poster: "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg", logo: "" },
        { id: 2, title: "Dune: Part Two", rating: 8.3, release_date: "2024-02-27", overview: "", poster: "https://image.tmdb.org/t/p/w500/ylkdrn23p3gQcHx7ukIfuy2TE.jpg", logo: "" },
        { id: 3, title: "Hoopers", rating: 7.7, release_date: "2026-01-01", overview: "", poster: "https://image.tmdb.org/t/p/w500/2RrLuIfIzGWWIH8IAEo6o0IYHmx.jpg", logo: "" },
        { id: 4, title: "Scream 7", rating: 5.1, release_date: "2026-07-19", overview: "", poster: "https://image.tmdb.org/t/p/w500/hz7TdCrpLLt2Dz7S3PS2HG9rpAO.jpg", logo: "" },
        { id: 5, title: "Oppenheimer", rating: 8.1, release_date: "2023-07-19", overview: "", poster: "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg", logo: "" },
        { id: 6, title: "Dune: Part Two", rating: 8.3, release_date: "2024-02-27", overview: "", poster: "https://image.tmdb.org/t/p/w500/ylkdrn23p3gQcHx7ukIfuy2TE.jpg", logo: "" },
    ],
    upcoming: [
        { id: 1, title: "Scream 7", rating: 5.1, release_date: "2026-07-19", overview: "", poster: "https://image.tmdb.org/t/p/w500/hz7TdCrpLLt2Dz7S3PS2HG9rpAO.jpg", logo: "" },
        { id: 2, title: "Hoopers", rating: 7.7, release_date: "2026-01-01", overview: "", poster: "https://image.tmdb.org/t/p/w500/2RrLuIfIzGWWIH8IAEo6o0IYHmx.jpg", logo: "" },
        { id: 3, title: "Dune: Part Two", rating: 8.3, release_date: "2024-02-27", overview: "", poster: "https://image.tmdb.org/t/p/w500/ylkdrn23p3gQcHx7ukIfuy2TE.jpg", logo: "" },
        { id: 4, title: "Oppenheimer", rating: 8.1, release_date: "2023-07-19", overview: "", poster: "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg", logo: "" },
        { id: 5, title: "Scream 7", rating: 5.1, release_date: "2026-07-19", overview: "", poster: "https://image.tmdb.org/t/p/w500/hz7TdCrpLLt2Dz7S3PS2HG9rpAO.jpg", logo: "" },
        { id: 6, title: "Hoopers", rating: 7.7, release_date: "2026-01-01", overview: "", poster: "https://image.tmdb.org/t/p/w500/2RrLuIfIzGWWIH8IAEo6o0IYHmx.jpg", logo: "" },
    ],
}



export default function MoviesPage() {

    const [activeCategory, setActiveCategory] = useState<'popular' | 'topRated' | 'upcoming'>('popular')

    return (
        <div className="pt-15">
            {/* ─── CATEGORY SECTION ─── */}
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pb-12 pt-2">
                {/* Tab Bar */}
                <div className="flex items-center gap-1 mb-6 w-fit bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1">
                    {categories.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key as typeof activeCategory)}
                            className={`relative px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer
                                ${activeCategory === key
                                    ? 'bg-white text-black shadow-lg shadow-white/10'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <span className="relative z-10">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Movie Cards Grid */}
                <div
                    key={activeCategory}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
                    style={{ animation: 'fadeInUp 0.4s ease-out' }}
                >
                    {categoryMovies[activeCategory].map((movie, idx) => (
                        <Link
                            key={`${movie.id}-${idx}`}
                            href={`/movie/${movie.title}`}
                            className="group relative flex flex-col gap-2 cursor-pointer"
                        >
                            {/* Poster */}
                            <div className="relative aspect-2/3 rounded-lg overflow-hidden bg-zinc-900 ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                                <img
                                    src={movie.poster}
                                    alt={movie.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {/* Rank badge */}
                                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white border border-white/20">
                                    {idx + 1}
                                </div>
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40">
                                        <Play className="w-4 h-4 fill-white ml-0.5" />
                                    </div>
                                </div>
                                {/* Bottom fade */}
                                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />
                            </div>
                            {/* Info */}
                            <div className="px-0.5">
                                <p className="text-white text-xs sm:text-sm font-semibold truncate group-hover:text-zinc-200 transition-colors">
                                    {movie.title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[#46d369] text-[10px] sm:text-xs font-bold">
                                        {Math.floor(movie.rating * 10)}%
                                    </span>
                                    <span className="text-zinc-500 text-[10px] sm:text-xs">
                                        {movie.release_date?.slice(0, 4)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}