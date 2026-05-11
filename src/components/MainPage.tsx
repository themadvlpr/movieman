'use client'

import Link from 'next/link';
import { Play } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check } from "lucide-react"
import LibraryControlsButtons from "@/components/ui/LibraryConrolButtons"
import { genresById } from "@/lib/tmdb/tmdb-types"
import { useSearchParams, usePathname } from 'next/navigation';
import { useRouter } from "next/navigation";
import MainPageSkeleton from "@/components/skeletons/MainPageSkeleton"
import { Movie } from "@/lib/tmdb/tmdb-types"
import { dbMediaStatus } from "@/lib/db/db-types";
import StarRating from "@/components/ui/StarRating";
import { useTranslations } from 'next-intl';
import { useCookies } from 'next-client-cookies';

export default function MainPage({ movies, initialGenreId, userId }: { movies: (Movie & { initialDbState: dbMediaStatus })[], initialGenreId: number, userId: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const t = useTranslations();
    const cookies = useCookies();

    // Derive selectedGenreId from URL if present, otherwise use initialGenreId
    const urlGenre = searchParams.get('genre');
    const selectedGenreId = urlGenre ? parseInt(urlGenre, 10) : initialGenreId;



    const [currentPage, setCurrentPage] = useState(0)
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);



    // Reset carousel page when genre changes
    useEffect(() => {
        setCurrentPage(0);
    }, [selectedGenreId]);

    const listRef = useRef<HTMLDivElement>(null);

    // Scroll active item into view
    useEffect(() => {
        const activeItem = listRef.current?.children[currentPage] as HTMLElement;
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [currentPage]);

    // Function to track loaded images
    const handleImageLoad = (path: string) => {
        setLoadedImages((prev) => {
            if (prev.has(path)) return prev;
            return new Set(prev).add(path);
        });
    };


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

    const currentMovie = movies[currentPage];

    const {
        id,
        title,
        vote_average: rating,
        release_date,
        tagline,
        backdrop_path,
        origin_country: country,
        logo_path,
        initialDbState
    } = currentMovie;

    console.log('currentMovie', id, title);

    if (!movies || movies.length === 0) {
        return <MainPageSkeleton />;
    }

    return (
        <div className='flex-1 h-full relative flex flex-col justify-end bg-black lg:bg-[#010101] overflow-hidden'
            onClick={() => setIsDropdownOpen(false)}>
            {/* Background Image Container */}
            <div className='absolute inset-x-0 top-0 h-[75dvh] lg:h-full lg:inset-0 bg-black lg:bg-transparent overflow-hidden pointer-events-none'>
                <div className='relative h-full w-full'>
                    {/* Pulsing Loader (Skeleton) */}
                    <AnimatePresence>
                        {!loadedImages.has(backdrop_path) && (
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
                                        {t('MainPage.loadingPoster')}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
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
                                onLoad={() => handleImageLoad(backdrop_path)}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Optimized Overlay System */}
                    <div className='absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/20 lg:from-[#010101] z-10'></div>
                    <div className='absolute inset-0 bg-linear-to-l from-black/60 via-transparent to-transparent lg:via-40% z-10'></div>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-16 sm:pt-20 lg:pt-24 pb-4 sm:pb-6 md:pb-8 flex flex-col sm:flex-row items-start sm:items-end justify-end sm:justify-between gap-4 sm:gap-10 mt-auto bg-linear-to-t from-black via-black/90 to-transparent sm:bg-none overflow-hidden">
                <div key={title} className="space-y-3 sm:space-y-5 w-full max-w-2xl animate-[fadeInUp_0.8s_ease-out] will-change-transform">
                    {logo_path ? (
                        <div className="mb-3 sm:mb-6 lg:mb-8 origin-bottom-left">
                            <Link
                                href={`/movies/${id}`}
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
                            href={`/movies/${id}`}
                            className="block group transition-transform duration-500 hover:scale-110 active:scale-95 w-fit"
                        >
                            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 sm:mb-8 lg:mb-12 drop-shadow-2xl leading-[0.95] text-mdnichrome">
                                {title}
                            </h1>
                        </Link>

                    )}

                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 font-medium text-white/90 drop-shadow-md text-sm sm:text-base cursor-default">
                        {rating > 0 && (
                            <>
                                <StarRating text={`${rating && rating.toFixed(1)}`} ratingType="tmdb" />
                                <span className="text-white/40">|</span>
                            </>
                        )}
                        <span className="text-white/80">
                            {release_date?.slice(0, 4)}
                        </span>

                        {initialDbState.userRating ? initialDbState.userRating > 0 &&
                            <>
                                <span className="text-white/40">|</span>
                                <StarRating text={`${initialDbState.userRating && initialDbState.userRating.toFixed(1)}`} ratingType="my" />
                            </> :
                            null}

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
                            <span className="text-sm sm:text-base font-bold">{t('MainPage.discover')}</span>
                        </Link>
                        <LibraryControlsButtons
                            mediaId={id}
                            mediaData={{
                                titleEn: title,
                                posterEn: backdrop_path,
                                tmdbRating: rating,
                                releaseDate: release_date,
                                genreIds: currentMovie.genre_ids?.join(',')
                            }}
                            type="movie"
                            userId={userId}
                            initialState={initialDbState}
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
                            <span className="opacity-60 font-medium">{t('MainPage.genre')}:</span>
                            <span>{t(`genres.${selectedGenreId.toString()}`)}</span>
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
                                                cookies.set('selectedGenreId', genreIdStr);
                                                setIsDropdownOpen(false);

                                                const params = new URLSearchParams(searchParams.toString());
                                                params.set('genre', genreIdStr);
                                                router.push(pathname + '?' + params.toString(), { scroll: false });
                                            }}
                                            className="w-full cursor-pointer flex items-center justify-between px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                                        >
                                            {t(`genres.${id}`)}
                                            {selectedGenreId === Number(id) && <Check className="w-3.5 h-3.5 text-white" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {/* Switch slide buttons & Genre Dropdown for mobile */}
                    <div className="flex sm:hidden items-center justify-between w-full sm:w-auto sm:bg-black/40 sm:backdrop-blur-md sm:p-1.5 sm:rounded-full sm:border sm:border-white/10">
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
                                <span className="truncate">{t(`genres.${selectedGenreId.toString()}`)}</span>
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
                                                    cookies.set('selectedGenreId', genreIdStr);
                                                    setIsDropdownOpen(false);

                                                    const params = new URLSearchParams(searchParams.toString());
                                                    params.set('genre', genreIdStr);
                                                    router.push(pathname + '?' + params.toString(), { scroll: false });
                                                }}
                                                className="w-full cursor-pointer flex items-center justify-between px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                                            >
                                                {t(`genres.${id}`)}
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

                    {/* ── RIGHT: typographic slide navigator ── */}
                    <div className="sm:flex hidden flex-col shrink-0 w-56">
                        {/* Counter */}
                        <div className="flex items-baseline gap-2 mb-4 select-none">
                            <span className="text-white text-4xl font-bold tabular-nums leading-none tracking-tight">
                                {String(currentPage + 1).padStart(2, "0")}
                            </span>
                            <span className="text-white/20 text-base font-medium tabular-nums">
                                / {String(movies.length).padStart(2, "0")}
                            </span>
                        </div>

                        {/* Thin rule */}
                        <div className="w-8 h-px bg-white/20 mb-4" />

                        {/* Title list */}
                        <div ref={listRef} className="flex flex-col overflow-y-auto max-h-[30vh] lg:max-h-[35vh] scrollbar-none pr-1">
                            {movies.slice(0, movies.length).map((movie, idx) => {
                                const isActive = idx === currentPage;
                                return (
                                    <button
                                        key={movie.id}
                                        onClick={() => changePage(idx)}
                                        className={`group flex items-stretch gap-3 py-[7px] text-left transition-opacity duration-400 ${isActive
                                            ? "opacity-100"
                                            : "opacity-20 hover:opacity-50"
                                            }`}
                                    >
                                        {/* Vertical track */}
                                        <div className="w-px bg-white/15 relative self-stretch shrink-0">
                                            {isActive && (
                                                <div
                                                    key={movie.id + idx}
                                                    className="absolute inset-x-0 top-0 bg-white"
                                                    style={{
                                                        height: "100%",
                                                        transformOrigin: "top",
                                                        transform: "scaleY(0)",
                                                        animation: "progressScaleV 15s linear forwards",
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* Title */}
                                        <span
                                            className={`text-[13px] leading-snug truncate transition-all duration-300 ${isActive
                                                ? "text-white font-semibold"
                                                : "text-white font-normal group-hover:text-white"
                                                }`}
                                        >
                                            {movie.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}