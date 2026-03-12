'use client'

import Link from "next/link"
import { Bookmark, Eye, Heart, Play, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

const movies = [
    {
        id: 1,
        title: "Hoopers",
        rating: 7.7,
        release_date: "2026-01-01",
        overview: "Act natural.",
        poster: 'https://image.tmdb.org/t/p/original/2RrLuIfIzGWWIH8IAEo6o0IYHmx.jpg',
        logo: 'https://image.tmdb.org/t/p/w500/xS2WPzXYUkW9IZwSL56tV74APPm.png',
        country: 'US'
    },
    {
        id: 2,
        title: "Dune: Part Two",
        rating: 8.3,
        release_date: "2024-02-27",
        overview: "Long live the fighters.",
        poster: "https://image.tmdb.org/t/p/original/ylkdrn23p3gQcHx7ukIfuy2CkTE.jpg",
        logo: "https://image.tmdb.org/t/p/w500/woifx7xduIyJYq8ktCiN36zt9Xu.png",
        country: 'UK'
    },
    {
        id: 3,
        title: "Oppenheimer",
        rating: 8.1,
        release_date: "2023-07-19",
        overview: "The world forever changes.",
        poster: "https://image.tmdb.org/t/p/original/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
        logo: 'https://image.tmdb.org/t/p/w500/b07VisHvZb0WzUpA8VB77wfMXwg.png',
        country: 'AU'
    },
    {
        id: 4,
        title: "Scream 7",
        rating: 5.1,
        release_date: "2026-07-19",
        overview: "Burn it all down.",
        poster: "https://image.tmdb.org/t/p/original/hz7TdCrpLLt2Dz7S3PS2HG9rpAO.jpg",
        logo: 'https://image.tmdb.org/t/p/w500/2JRh8uPqNGlZC72vJawAGHToOnk.png',
        country: 'ES'
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

    const { id, title, rating, release_date, overview, poster, logo, country } = currentMovie

    return (
        <div className='flex-1 relative flex flex-col justify-end bg-black lg:bg-[#010101]'>
            {/* Background Image Container */}
            <div className='absolute inset-x-0 top-0 h-[55dvh] lg:h-full lg:inset-0 bg-black lg:bg-transparent overflow-hidden pointer-events-none'>
                <div className='relative h-full w-full'>
                    <Image
                        key={poster}
                        src={poster}
                        alt="Backdrop"
                        fill
                        priority
                        quality={90}
                        className="object-cover select-none object-top animate-[kenburns_20s_ease-in-out_infinite_alternate]"
                        sizes="100vw"
                        draggable={false}
                    />
                    <div className='absolute inset-0 bg-linear-to-b from-black/10 via-black/20 to-black via-70% lg:via-60% lg:to-[#010101]'></div>
                    <div className='absolute inset-0 bg-linear-to-r from-black/80 lg:via-black/40 to-transparent lg:via-50%'></div>
                    <div className='absolute inset-0 bg-linear-to-t from-black lg:from-[#010101] via-transparent to-transparent opacity-50 lg:opacity-10'></div>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-20 sm:pt-28 lg:pt-32 pb-6 sm:pb-8 md:pb-12 flex flex-col lg:flex-row items-start lg:items-end justify-end lg:justify-between gap-6 lg:gap-15 mt-auto bg-linear-to-t from-black via-black/90 to-transparent lg:bg-none">
                <div key={title} className="space-y-3 sm:space-y-5 w-full max-w-2xl animate-[fadeInUp_0.8s_ease-out]">
                    {logo ? (
                        <div className="mb-4 sm:mb-8 lg:mb-12 origin-bottom-left">
                            <Link href={`/movie/${id}/${title}`} className="block group transition-transform duration-500 hover:scale-110 active:scale-95 border w-fit">
                                <Image
                                    src={logo}
                                    alt={title}
                                    width={500}
                                    height={200}
                                    priority
                                    className="w-auto select-none max-h-24 sm:max-h-32 md:max-h-48 object-contain 
                   drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] pointer-events-none"
                                    draggable={false}
                                />
                            </Link>
                        </div>
                    ) : (
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-8 lg:mb-12 drop-shadow-2xl leading-[0.95] text-mdnichrome">
                            {title}
                        </h1>
                    )}

                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 font-medium text-white/90 drop-shadow-md text-sm sm:text-base cursor-default">
                        <span className="text-[#46d369] font-bold">
                            {Math.floor(rating * 10)}% Match
                        </span>
                        <span className="text-white/40">|</span>
                        <span className="text-white/80">
                            {release_date?.slice(0, 4)}
                        </span>
                        <span className="text-white/40">|</span>
                        <span className="text-white/80">
                            {country}
                        </span>

                    </div>

                    <p className="text-sm italic sm:text-base md:text-lg leading-relaxed text-white/80 drop-shadow-lg line-clamp-3 sm:line-clamp-4 max-w-xl">
                        {overview}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                        <Link
                            href={`/movie/${id}/${title}`}
                            className="group flex flex-1 sm:flex-none justify-center gap-2 sm:gap-2.5 items-center px-5 sm:px-7 py-2.5 sm:py-3 bg-white text-black rounded hover:bg-white/90 transition-all active:scale-95"
                        >
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
                            <span className="text-sm sm:text-base font-bold">Discover</span>
                        </Link>



                        <div className="flex items-center gap-3 ml-2">
                            <button
                                aria-label="Add to Watched"
                                className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 border border-white/5 hover:border-white/20 backdrop-blur-md transition-all active:scale-90 cursor-pointer group"
                            >
                                <Eye className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:fill-zinc-300 group-active:fill-zinc-50" />
                            </button>
                            <button
                                aria-label="Add to Wishlist"
                                className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 border border-white/5 hover:border-white/20 backdrop-blur-md transition-all active:scale-90 cursor-pointer group"
                            >
                                <Plus className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:fill-zinc-300 group-active:fill-zinc-50" />
                            </button>
                            <button
                                aria-label="Add to Favorites"
                                className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 border border-white/5 hover:border-white/20 backdrop-blur-md transition-all active:scale-90 cursor-pointer group"
                            >
                                <Heart className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:fill-zinc-300 group-active:fill-zinc-50" />
                            </button>
                            <button
                                aria-label="Add to Favorites"
                                className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 border border-white/5 hover:border-white/20 backdrop-blur-md transition-all active:scale-90 cursor-pointer group"
                            >
                                <Bookmark className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:fill-zinc-300 group-active:fill-zinc-50" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row lg:flex-col items-center lg:items-end w-full lg:w-auto mt-4 lg:mt-0 gap-4 lg:gap-6">
                    {/* Switch slide buttons & Dots for mobile */}
                    <div className="flex items-center justify-between w-full lg:w-auto lg:bg-black/40 lg:backdrop-blur-md lg:p-1.5 lg:rounded-full lg:border lg:border-white/10">
                        {/* Prev Button */}
                        <button
                            onClick={() =>
                                changePage(
                                    currentPage > 0 ? currentPage - 1 : movies.length - 1
                                )
                            }
                            className="p-3 lg:p-3 rounded-full bg-black/40 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border border-white/10 lg:border-transparent hover:bg-white/20 transition-colors text-white cursor-pointer order-1"
                            aria-label="Previous"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Divider for Desktop */}
                        <div className="hidden lg:block w-px h-6 bg-white/20 order-2"></div>

                        {/* Dots for Mobile */}
                        <div className="flex lg:hidden items-center justify-center gap-2 flex-1 order-2">
                            {movies.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => changePage(idx)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentPage ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                                        }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={() =>
                                changePage(
                                    currentPage < movies.length - 1 ? currentPage + 1 : 0
                                )
                            }
                            className="p-3 lg:p-3 rounded-full bg-black/40 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border border-white/10 lg:border-transparent hover:bg-white/20 transition-colors text-white cursor-pointer order-3"
                            aria-label="Next"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Mini preview of next movie */}
                    <div
                        className="hidden lg:block group relative w-96 aspect-video rounded-lg overflow-hidden cursor-pointer shadow-2xl ring-1 ring-white/30 hover:ring-white/40 transition-all duration-300 bg-[#1a1a1a]"
                        onClick={() => changePage((currentPage + 1) % movies.length)}
                    >
                        <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wider text-white/90 border border-white/10">
                            Next Up
                        </div>
                        <div className="relative w-full h-full overflow-hidden">
                            <Image
                                key={nextMovie.poster}
                                src={nextMovie.poster}
                                alt={nextMovie.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="select-none object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                draggable={false}
                            />
                        </div>
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