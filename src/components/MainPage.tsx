'use client'

import Link from "next/link"
import { Play } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check, Star } from "lucide-react"
import LibraryControlsButtons from "@/components/ui/LibraryControlsButtons"
import { genresById } from "@/lib/tmdb/types/tmdb-types"
import Cookies from "js-cookie"
import { useQuery } from "@tanstack/react-query"
import { getDiscoverMovies } from "@/lib/tmdb/getDiscoverMovies"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Loader from "@/components/ui/Loader"



export default function MainPage({ initialGenreId, userId }: { initialGenreId: number, userId: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Derive selectedGenreId from URL if present, otherwise use initialGenreId
    const urlGenre = searchParams.get('genre');
    const selectedGenreId = urlGenre ? parseInt(urlGenre, 10) : initialGenreId;

    const { data } = useQuery({
        queryKey: ['discovermovies', selectedGenreId],
        queryFn: () => getDiscoverMovies(selectedGenreId.toString()),
    })

    const movies = data?.results || []
    const [currentPage, setCurrentPage] = useState(0)
    const [imageLoading, setImageLoading] = useState(true);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Reset carousel page when genre changes
    useEffect(() => {
        setCurrentPage(0);
    }, [selectedGenreId]);

    // Reset image loading state when movie changes
    useEffect(() => {
        setImageLoading(true);
    }, [currentPage]);

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


    if (!movies || movies.length === 0) {
        return <Loader />;
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


    return (
        <div className='flex-1 relative flex flex-col justify-end bg-black lg:bg-[#010101]'
            onClick={() => setIsDropdownOpen(false)}>
            {/* Background Image Container */}
            <div className='absolute inset-x-0 top-0 h-[75dvh] lg:h-full lg:inset-0 bg-black lg:bg-transparent overflow-hidden pointer-events-none'>
                <div className='relative h-full w-full'>
                    {/* Pulsing Loader (Skeleton) */}
                    <AnimatePresence>
                        {imageLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-zinc-900/90 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-full border-4 border-white/10 border-t-white/90 animate-spin shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
                                        <div className="absolute inset-0 blur-lg bg-white/5 rounded-full" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 animate-pulse">
                                        Loading Poster
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={`https://image.tmdb.org/t/p/original${backdrop_path}`}
                                alt={title}
                                fill
                                priority={true}
                                quality={90}
                                className="object-cover select-none object-top animate-kenburns"
                                sizes='100vw'
                                draggable={false}
                                onLoad={() => setImageLoading(false)}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Optimized Overlay System */}
                    <div className='absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/20 lg:from-[#010101] z-10'></div>
                    <div className='absolute inset-0 bg-linear-to-l from-black/60 via-transparent to-transparent lg:via-40% z-10'></div>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-20 sm:pt-28 lg:pt-32 pb-6 sm:pb-8 md:pb-12 flex flex-col sm:flex-row items-start sm:items-end justify-end sm:justify-between gap-6 sm:gap-15 mt-auto bg-linear-to-t from-black via-black/90 to-transparent sm:bg-none">
                <div key={title} className="space-y-3 sm:space-y-5 w-full max-w-2xl animate-[fadeInUp_0.8s_ease-out] will-change-transform">
                    {logo_path ? (
                        <div className="mb-4 sm:mb-8 lg:mb-12 origin-bottom-left">
                            <Link
                                href={`/movies/${id}`}
                                className="block group transition-transform duration-500 hover:scale-110 active:scale-95 w-fit"
                            >
                                <Image
                                    src={`https://image.tmdb.org/t/p/w500/${logo_path}`}
                                    alt={title}
                                    width={600}
                                    height={240}
                                    priority={true}
                                    className="select-none w-64 sm:w-80 md:w-100 h-auto object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] pointer-events-none"
                                    draggable={false}
                                />
                            </Link>
                        </div>
                    ) : (
                        <Link
                            href={`/movies/${id}`}
                            className="block group transition-transform duration-500 hover:scale-110 active:scale-95 w-fit"
                        >
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-8 lg:mb-12 drop-shadow-2xl leading-[0.95] text-mdnichrome">
                                {title}
                            </h1>
                        </Link>

                    )}

                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 font-medium text-white/90 drop-shadow-md text-sm sm:text-base cursor-default">
                        {rating > 0 && (
                            <>
                                <div className='flex items-center gap-1.5 text-zinc-100'>
                                    <Star className='w-4 h-4 fill-amber-400 text-amber-400' />
                                    <span>{rating && rating.toFixed(1)}</span>
                                </div>
                                <span className="text-white/40">|</span>
                            </>
                        )}
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
                            href={`/movies/${id}`}
                            className="group max-w-fit flex flex-1 sm:flex-none justify-center gap-2 sm:gap-2.5 items-center px-5 sm:px-7 py-2.5 sm:py-3 bg-white text-black rounded hover:bg-white/90 transition-all active:scale-95"
                        >
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
                            <span className="text-sm sm:text-base font-bold">Discover</span>
                        </Link>
                        <LibraryControlsButtons
                            mediaId={id}
                            mediaData={{
                                title,
                                poster: backdrop_path,
                                rating,
                                year: release_date
                            }}
                            type="movie"
                            userId={userId}
                        />
                    </div>
                </div>

                <div className="border-t border-zinc-500 sm:border-0 pt-4 flex flex-row sm:flex-col items-center sm:items-end w-full sm:w-auto mt-0 gap-4 sm:gap-6">
                    {/* Genre Dropdown - Desktop */}
                    <div className="relative hidden sm:inline-block text-left mb-2 sm:mb-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen) }}
                            className="group cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-all duration-300 text-sm font-semibold text-white/90"
                        >
                            <span className="opacity-60 font-medium">Genre:</span>
                            <span>{genresById[selectedGenreId as keyof typeof genresById]}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute bottom-full sm:bottom-auto sm:top-full left-0 w-48 rounded-lg bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-50 py-2 scrollbar-thin scrollbar-thumb-white/10 max-h-[40dvh] overflow-y-auto"
                                >
                                    {Object.entries(genresById).map(([id, name]) => (
                                        <button
                                            key={id}
                                            onClick={() => {
                                                const genreIdStr = id;
                                                Cookies.set('selectedGenreId', genreIdStr, { expires: 7 });
                                                setIsDropdownOpen(false);

                                                const params = new URLSearchParams(searchParams.toString());
                                                params.set('genre', genreIdStr);
                                                router.push(pathname + '?' + params.toString(), { scroll: false });
                                            }}
                                            className="w-full cursor-pointer flex items-center justify-between px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                                        >
                                            {name}
                                            {selectedGenreId === Number(id) && <Check className="w-3.5 h-3.5 text-white" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {/* Switch slide buttons & Genre Dropdown for mobile */}
                    <div className="flex items-center justify-between w-full sm:w-auto sm:bg-black/40 sm:backdrop-blur-md sm:p-1.5 sm:rounded-full sm:border sm:border-white/10">
                        {/* Prev Button */}
                        <button
                            onClick={() =>
                                changePage(
                                    currentPage > 0 ? currentPage - 1 : movies.length - 1
                                )
                            }
                            className="p-2 md:p-3 rounded-full bg-black/40 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border border-white/10 sm:border-transparent hover:bg-white/20 transition-colors text-zinc-400 cursor-pointer order-1 shrink-0"
                            aria-label="Previous"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Divider for Desktop */}
                        <div className="hidden sm:block w-px h-6 bg-white/20 order-2"></div>

                        {/* Genre Dropdown - Mobile */}
                        <div className="relative flex sm:hidden order-2 flex-1 justify-center px-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen) }}
                                className="group cursor-pointer mx-auto flex items-center justify-between w-full max-w-[160px] gap-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 transition-all duration-300 text-xs font-semibold text-white/90"
                            >
                                <span className="truncate">{genresById[selectedGenreId as keyof typeof genresById]}</span>
                                <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-50 py-2 scrollbar-thin scrollbar-thumb-white/10 max-h-[40dvh] overflow-y-auto"
                                    >
                                        {Object.entries(genresById).map(([id, name]) => (
                                            <button
                                                key={id}
                                                onClick={() => {
                                                    const genreIdStr = id;
                                                    Cookies.set('selectedGenreId', genreIdStr, { expires: 7 });
                                                    setIsDropdownOpen(false);

                                                    const params = new URLSearchParams(searchParams.toString());
                                                    params.set('genre', genreIdStr);
                                                    router.push(pathname + '?' + params.toString(), { scroll: false });
                                                }}
                                                className="w-full cursor-pointer flex items-center justify-between px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                                            >
                                                {name}
                                                {selectedGenreId === Number(id) && <Check className="w-3.5 h-3.5 text-white" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                        {/* Progress Overlay - unfades from left to right over 15s using scaleX */}
                        <div
                            key={`progress-${currentPage}`}
                            className="absolute inset-x-0 bottom-0 top-0 bg-white/15 origin-left pointer-events-none"
                            style={{
                                animation: "progressScale 15s linear forwards",
                                willChange: "transform"
                            }}
                        ></div>
                        <style jsx>{`
                            @keyframes progressScale { 
                                from { transform: scaleX(0); }
                                to { transform: scaleX(1); }
                            }
                        `}</style>
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black via-black/80 to-transparent pt-12">
                            <h4 className="text-white font-bold text-base truncate drop-shadow-md transition-colors">
                                {nextMovie.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                                <span>
                                    {nextMovie.release_date?.slice(0, 4)}
                                </span>
                                {nextMovie.vote_average > 0 && (
                                    <>
                                        <span>•</span>
                                        <div className='flex items-center gap-1.5 text-zinc-100'>
                                            <Star className='w-3 h-3 fill-amber-400 text-amber-400' />
                                            <span>{nextMovie.vote_average.toFixed(1)}</span>
                                        </div>
                                    </>
                                )}
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