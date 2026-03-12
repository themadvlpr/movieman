'use client'

import Link from "next/link"
import { InfoIcon, Play } from "lucide-react"
import { useState, useEffect } from "react"

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

export default function MainPage() {
    const [currentPage, setCurrentPage] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentPage((prev) => (prev + 1) % movies.length)
        }, 15000)
        return () => clearInterval(timer)
    }, [])

    const changePage = (index: number) => {
        setCurrentPage(index)
    }

    const currentMovie = movies[currentPage]
    const nextMovie = movies[(currentPage + 1) % movies.length]

    const { title, rating, release_date, overview, poster, logo } = currentMovie

    return (
        <div className='flex-1 relative'>
            <div className='absolute top-0 inset-0 overflow-hidden'>
                <div className='relative h-full'>
                    <img
                        key={poster}
                        src={poster}
                        alt='Backdrop'
                        className='w-full h-full object-cover object-top animate-[kenburns_20s_ease-in-out_infinite_alternate]'
                        style={{
                            animation:
                                'kenburns 20s ease-in-out infinite alternate',
                        }}
                    />
                    <div className='absolute inset-0 bg-linear-to-b from-black/10 via-black/20 to-[#010101] via-60%'></div>
                    <div className='absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent via-50%'></div>
                    <div className='absolute inset-0 bg-linear-to-t from-[#010101] via-transparent to-transparent opacity-10'></div>
                </div>
            </div>

            <div className="absolute z-30 inset-x-12 bottom-12 flex items-end justify-between gap-15">
                <div key={title} className="space-y-5 max-w-2xl animate-[fadeInUp_0.8s_ease-out]">
                    {logo ? (
                        <div className="mb-12 origin-bottom-left transition-transform duration-700">
                            <img
                                src={logo}
                                alt={title}
                                className="w-auto max-h-48 object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
                            />
                        </div>
                    ) : (
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-12 drop-shadow-2xl leading-[0.95] text-mdnichrome">
                            {title}
                        </h1>
                    )}

                    <div className="flex items-center gap-3 mb-6 font-medium text-white/90 drop-shadow-md">
                        <span className="text-[#46d369] font-bold text-base">
                            {Math.floor(rating * 10)}% Match
                        </span>
                        <span className="text-white/40">|</span>
                        <span className="text-white/80">
                            {release_date?.slice(0, 4)}
                        </span>
                        <span className="text-white/40">|</span>
                        <span className="px-2 py-0.5 border border-white/30 rounded text-xs font-semibold uppercase bg-white/5">
                            HD
                        </span>
                    </div>

                    <p className="text-base md:text-lg leading-relaxed text-white/80 drop-shadow-lg line-clamp-3 max-w-xl">
                        {overview}
                    </p>

                    <div className="flex items-center gap-4 pt-2">
                        <Link
                            href={`/movie/${title}`}
                            className="group flex gap-2.5 items-center px-7 py-3 bg-white text-black rounded hover:bg-white/90 transition-all active:scale-95"
                        >
                            <Play className="w-5 h-5 fill-black" />
                            <span className="text-base font-bold">Watch Now</span>
                        </Link>

                        <button
                            // onClick={() => handleOpenDialog(item.id)}
                            className="group flex gap-2.5 items-center px-7 py-3 bg-white/20 text-white rounded hover:bg-white/30 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                        >
                            <InfoIcon className="w-5 h-5" />
                            <span className="text-base font-semibold">
                                More Info
                            </span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-6">
                    {/* Switch slide buttons */}
                    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10">
                        <button
                            onClick={() =>
                                changePage(
                                    currentPage > 0 ? currentPage - 1 : movies.length - 1
                                )
                            }
                            className="p-3 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
                            aria-label="Previous"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                        <div className="w-px h-6 bg-white/20"></div>
                        <button
                            onClick={() =>
                                changePage(
                                    currentPage < movies.length - 1 ? currentPage + 1 : 0
                                )
                            }
                            className="p-3 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
                            aria-label="Next"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Mini preview of next movie */}
                    <div
                        className="group relative w-96 aspect-video rounded-lg overflow-hidden cursor-pointer shadow-2xl ring-1 ring-white/30 hover:ring-white/40 transition-all duration-300 bg-[#1a1a1a]"
                        onClick={() => changePage((currentPage + 1) % movies.length)}
                    >
                        <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wider text-white/90 border border-white/10">
                            Next Up
                        </div>
                        <img
                            key={nextMovie.poster}
                            src={nextMovie.poster}
                            alt={nextMovie.title}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        {/* Progress Overlay - unfades from left to right over 15s */}
                        <div
                            key={`progress-${currentPage}`}
                            className="absolute inset-0 bg-linear-to-r from-white/25 via-white/15 to-white/10 pointer-events-none"
                            style={{
                                animation: "progressUnfade 15s linear forwards",
                            }}
                        ></div>
                        <style jsx>{`@keyframes progressUnfade { from {clip-path: inset(0 0 0 0);}to {clip-path: inset(0 0 0 100%);}}`}</style>
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black via-black/80 to-transparent pt-12">
                            <h4 className="text-white font-bold text-base truncate drop-shadow-md transition-colors">
                                {nextMovie.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                                <span>
                                    {nextMovie.release_date?.slice(0, 4)}
                                </span>
                                <span>•</span>
                                <span className="text-[#46d369]">
                                    {Math.floor(nextMovie.rating * 10)}% Match
                                </span>
                            </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40">
                                <Play className="w-5 h-5 fill-white ml-0.5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}