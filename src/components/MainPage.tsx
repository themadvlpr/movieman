'use client'

import Link from "next/link"
import { Play } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import LibraryControlsButtons from "@/components/ui/LibraryControlsButtons"


interface Movie {
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    tagline?: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
    logo_path?: string;
    origin_country?: string;
}



const genresById = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
};


export default function MainPage() {
    const [currentPage, setCurrentPage] = useState(0)
    const [movies, setMovies] = useState<Movie[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const genreIds = Object.keys(genresById);
                const randomGenreId = genreIds[Math.floor(Math.random() * genreIds.length)];
                const response = await fetch(`/api/getMovieDiscover?genre=${randomGenreId}&page=1`);
                const fetchedData = await response.json();

                if (fetchedData.results) {
                    setMovies(fetchedData.results);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (!movies || movies.length === 0) return;
        const timer = setInterval(() => {
            setCurrentPage((prev) => (prev + 1) % movies.length);
        }, 15000);
        return () => clearInterval(timer);
    }, [movies, currentPage]);

    const changePage = (index: number) => {
        setCurrentPage(index);
    };

    if (loading || !movies || movies.length === 0) {
        return <div className="h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
    }

    const currentMovie = movies[currentPage];
    const nextMovie = movies[(currentPage + 1) % movies.length];

    const {
        id,
        title,
        vote_average: rating,
        release_date,
        tagline,
        backdrop_path,
        origin_country: country,
        logo_path,
    } = currentMovie;

    console.log(movies);



    return (
        <div className='flex-1 relative flex flex-col justify-end bg-black lg:bg-[#010101]'>
            {/* Background Image Container */}
            <div className='absolute inset-x-0 top-0 h-[75dvh] lg:h-full lg:inset-0 bg-black lg:bg-transparent overflow-hidden pointer-events-none'>
                <div className='relative h-full w-full'>
                    <Image
                        key={id}
                        src={`https://image.tmdb.org/t/p/original${backdrop_path}`}
                        alt={title}
                        fill
                        priority
                        quality={90}
                        className="object-cover select-none object-top animate-[kenburns_20s_ease-in-out_infinite_alternate]"
                        sizes="100vw"
                        draggable={false}
                    />

                    <div className='absolute inset-0 bg-linear-to-b from-black/10 via-black/20 to-black via-70% lg:via-60% lg:to-[#010101]'></div>
                    {/* <div className='absolute inset-0 bg-linear-to-r from-black/80 lg:via-black/40 to-transparent lg:via-50%'></div> */}
                    <div className='absolute inset-0 bg-linear-to-l from-black/80 lg:via-black/40 to-transparent lg:via-50%'></div>
                    <div className='absolute inset-0 bg-linear-to-t from-black lg:from-[#010101] via-transparent to-transparent opacity-50 lg:opacity-10'></div>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-20 sm:pt-28 lg:pt-32 pb-6 sm:pb-8 md:pb-12 flex flex-col sm:flex-row items-start sm:items-end justify-end sm:justify-between gap-6 sm:gap-15 mt-auto bg-linear-to-t from-black via-black/90 to-transparent sm:bg-none">
                <div key={title} className="space-y-3 sm:space-y-5 w-full max-w-2xl animate-[fadeInUp_0.8s_ease-out]">
                    {logo_path ? (
                        <div className="mb-4 sm:mb-8 lg:mb-12 origin-bottom-left">
                            <Link
                                href={`/movie/${id}`}
                                className="block group transition-transform duration-500 hover:scale-110 active:scale-95 w-fit"
                            >
                                <Image
                                    src={`https://image.tmdb.org/t/p/w500/${logo_path}`}
                                    alt={title}
                                    width={600}
                                    height={240}
                                    priority
                                    className="select-none w-64 sm:w-80 md:w-100 h-auto object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] pointer-events-none"
                                    draggable={false}
                                />
                            </Link>
                        </div>
                    ) : (
                        <Link
                            href={`/movie/${id}`}
                            className="block group transition-transform duration-500 hover:scale-110 active:scale-95 w-fit"
                        >
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-8 lg:mb-12 drop-shadow-2xl leading-[0.95] text-mdnichrome">
                                {title}
                            </h1>
                        </Link>

                    )}

                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 font-medium text-white/90 drop-shadow-md text-sm sm:text-base cursor-default">
                        <span className="text-[#46d369] font-bold">
                            {Math.floor(rating * 10)}% Match
                        </span>
                        <span className="text-white/40">|</span>
                        <span className="text-white/80">
                            {release_date?.slice(0, 4)}
                        </span>

                        {country && <>
                            <span className="text-white/40">|</span>
                            <span className="text-white/80">
                                {country}
                            </span>
                        </>}
                    </div>
                    {tagline && <p className="text-sm italic sm:text-base md:text-lg leading-relaxed text-white/80 drop-shadow-lg line-clamp-3 sm:line-clamp-4 max-w-xl">
                        {tagline}
                    </p>}

                    <div className="flex flex-wrap flex-col-reverse sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pt-2">
                        <Link
                            href={`/movie/${id}`}
                            className="group max-w-fit flex flex-1 sm:flex-none justify-center gap-2 sm:gap-2.5 items-center px-5 sm:px-7 py-2.5 sm:py-3 bg-white text-black rounded hover:bg-white/90 transition-all active:scale-95"
                        >
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
                            <span className="text-sm sm:text-base font-bold">Discover</span>
                        </Link>
                        <LibraryControlsButtons />
                    </div>
                </div>

                <div className="border-t border-zinc-500 sm:border-0 pt-4 flex flex-row sm:flex-col items-center sm:items-end w-full sm:w-auto mt-0 gap-4 sm:gap-6">
                    {/* Switch slide buttons & Dots for mobile */}
                    <div className="flex items-center justify-between w-full sm:w-auto sm:bg-black/40 sm:backdrop-blur-md sm:p-1.5 sm:rounded-full sm:border sm:border-white/10">
                        {/* Prev Button */}
                        <button
                            onClick={() =>
                                changePage(
                                    currentPage > 0 ? currentPage - 1 : movies.length - 1
                                )
                            }
                            className="p-2 md:p-3 rounded-full bg-black/40 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border border-white/10 sm:border-transparent hover:bg-white/20 transition-colors text-zinc-400 cursor-pointer order-1"
                            aria-label="Previous"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Divider for Desktop */}
                        <div className="hidden sm:block w-px h-6 bg-white/20 order-2"></div>
                        {/* Dots for Mobile */}
                        <div className="flex sm:hidden items-center justify-center flex-wrap px-10 gap-2 flex-1 order-2">
                            {movies.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => changePage(idx)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentPage ? "bg-zinc-400 w-6" : "bg-zinc-400/40 hover:bg-zinc-400/60"
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
                            className="p-2 md:p-3 rounded-full bg-black/40 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border border-white/10 sm:border-transparent hover:bg-white/20 transition-colors text-zinc-400 cursor-pointer order-3"
                            aria-label="Next"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Mini preview of next movie */}
                    <div
                        className="hidden sm:block group relative sm:w-64 md:w-80 lg:w-96 aspect-video rounded-lg overflow-hidden cursor-pointer shadow-2xl ring-1 ring-white/30 hover:ring-white/40 transition-all duration-300 bg-[#1a1a1a]"
                        onClick={() => changePage((currentPage + 1) % movies.length)}
                    >
                        <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wider text-white/90 border border-white/10">
                            Next Up
                        </div>
                        <div className="relative w-full h-full overflow-hidden">
                            <Image
                                key={nextMovie.id}
                                src={`https://image.tmdb.org/t/p/original${nextMovie.backdrop_path}`}
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
                                    {Math.floor(nextMovie.vote_average * 10)}% Match
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
        </div >
    )
}