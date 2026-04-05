'use client'

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { Play, Grid, List, Star, Filter } from "lucide-react"
import LibraryControlsButtons from "@/components/ui/LibraryControlsButtons"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import MoviePoster from "@/components/ui/MoviePoster"
import { updateViewMode } from "@/lib/tmdb/cookies-actions"
import { getTVSeriesAction } from "@/lib/tmdb/getTvSeries"
import { useTranslation } from "@/providers/LocaleProvider"
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig"
import { genresById } from "@/lib/tmdb/types/tmdb-types"


const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

// Survives client-side navigation — only resets on full page reload
let _tvScrollY = 0

export default function TvSeriesPage({ initialViewMode, userId }: { initialViewMode: 'grid' | 'list', userId: string }) {
    const { t, locale } = useTranslation();
    const tmdbLang = TMDB_LANGUAGES[locale as Locale];
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);


    const [activeCategory, setActiveCategory] = useState<'popular' | 'topRated'>(() => {
        const urlCategory = searchParams.get('category') as 'popular' | 'topRated';
        if (['popular', 'topRated'].includes(urlCategory)) return urlCategory;
        return 'popular'
    })

    const toggleView = async (mode: 'grid' | 'list') => {
        const newMode = mode === 'grid' ? 'list' : 'grid'
        setViewMode(newMode)
        await updateViewMode(newMode, 'tvseries')
    }

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['series-list', activeCategory, tmdbLang],
        queryFn: async ({ pageParam = 1 }) => {
            const result = await getTVSeriesAction(activeCategory, pageParam.toString(), userId, tmdbLang);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.total_pages) {
                return lastPage.page + 1
            }
            return undefined
        },
        initialPageParam: 1,
        staleTime: 1000 * 30, // 30 seconds
        refetchOnMount: "always",
    })

    const tvData = data?.pages.flatMap((page) => page.results) || []

    const [selectedGenre, setSelectedGenre] = useState('All')
    const [selectedYear, setSelectedYear] = useState('All')
    const loaderRef = useRef<HTMLDivElement>(null)
    const hasRestored = useRef(false)

    // Restore scroll once the data is confirmed loaded in the DOM.
    // setTimeout ensures we fire AFTER Next.js’s own scroll-to-top.
    useEffect(() => {
        if (status !== 'success') return
        if (_tvScrollY <= 0) return

        hasRestored.current = true
        const y = _tvScrollY
        _tvScrollY = 0

        setTimeout(() => {
            window.scrollTo({ top: y, behavior: 'instant' })
        }, 50)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status])


    // Sync state with URL
    useEffect(() => {
        const urlCategory = searchParams.get('category') as 'popular' | 'topRated';
        if (urlCategory && ['popular', 'topRated'].includes(urlCategory) && urlCategory !== activeCategory) {
            setActiveCategory(urlCategory);
        }
    }, [searchParams]);

    // Update URL when category changes
    const handleCategoryChange = (key: 'popular' | 'topRated') => {
        setActiveCategory(key);
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', key);
        router.push(pathname + '?' + params.toString(), { scroll: false });
    };

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('seriesCategory', activeCategory)
    }, [activeCategory]);

    useEffect(() => {
        localStorage.setItem('seriesViewMode', viewMode)
    }, [viewMode]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const target = entries[0]
            if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage()
            }
        }, {
            threshold: 0.1,
            rootMargin: '200px'
        })

        if (loaderRef.current) {
            observer.observe(loaderRef.current)
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current)
            }
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const categories = [
        { key: 'popular', label: t('categories', 'popular') },
        { key: 'topRated', label: t('categories', 'topRated') },
    ]


    return (
        <div className="pt-20 min-h-screen">
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-2">
                <h1 className="text-3xl sm:text-5xl font-bold mb-5">{t('nav', 'tvseries')}: {categories.find((cat: { key: string; label: string; }) => cat.key === activeCategory)?.label}</h1>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-8">
                    <div className="flex items-center gap-1 w-full sm:w-fit bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1 overflow-x-auto no-scrollbar">
                        {categories.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => handleCategoryChange(key as 'popular' | 'topRated')}
                                className={`relative flex-1 sm:flex-none px-2 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap
                                    ${activeCategory === key
                                        ? 'bg-white text-black shadow-lg shadow-white/10'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <span className="relative z-10">{label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1">
                            <button
                                onClick={() => toggleView('list')}
                                className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => toggleView('grid')}
                                className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {status === 'pending' ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
                    </div>
                ) : tvData.length > 0 ? (
                    <div className="flex flex-col gap-10">
                        <div
                            key={`${activeCategory}-${viewMode}-${selectedGenre}-${selectedYear}`}
                            className={viewMode === 'grid'
                                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
                                : "flex flex-col gap-3 sm:gap-4"}
                            style={{ animation: 'fadeInUp 0.4s ease-out' }}
                        >
                            {tvData.map((show, idx) => {
                                const isGrid = viewMode === 'grid';

                                const rankingBadge = (
                                    <div className={`absolute ${isGrid ? 'top-2 left-2 w-6 h-6 rounded-lg' : 'top-1.5 left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg'} bg-black/70 backdrop-blur-md flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white border border-white/20 z-30 pointer-events-none`}>
                                        {idx + 1}
                                    </div>
                                );

                                const controls = (
                                    <div className={isGrid
                                        ? "absolute top-0 inset-0 pointer-events-none z-20 flex flex-col items-center justify-end"
                                        : "absolute bottom-6 right-6 z-30 pointer-events-none translate-x-4 group-hover:translate-x-0 transition-all duration-300"
                                    }>
                                        <div className={`hidden sm:block pointer-events-auto ${isGrid ? 'mb-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300' : ''}`}>
                                            <LibraryControlsButtons
                                                mediaId={show.id}
                                                mediaData={{
                                                    title: show.name,
                                                    poster: show.poster_path,
                                                    rating: show.vote_average,
                                                    year: show.first_air_date,
                                                    description: show.overview
                                                }}
                                                type="tv"
                                                detailPage={false}
                                                userId={userId}
                                                initialState={show.initialDbState}
                                            />
                                        </div>
                                    </div>
                                );

                                return (
                                    <div className="relative group" key={`${show.id}-${idx}`}>
                                        <Link
                                            href={`/tvseries/${show.id}`}
                                            onClick={() => { _tvScrollY = window.scrollY }}
                                            className={isGrid
                                                ? "flex flex-col gap-2 sm:gap-3 cursor-pointer"
                                                : "flex flex-row gap-3 sm:gap-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/20 transition-all duration-300"
                                            }
                                        >
                                            {/* Poster Section */}
                                            <div className={isGrid
                                                ? "relative aspect-2/3 rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-500"
                                                : "relative w-[40%] sm:w-32 aspect-2/3 h-fit sm:h-auto rounded-lg sm:rounded-xl overflow-hidden shrink-0"
                                            }>
                                                <MoviePoster
                                                    src={show.poster}
                                                    alt={show.name}
                                                    priority={idx < 4}
                                                    className={isGrid ? "group-hover:scale-110 transition-transform duration-700 ease-out" : "group-hover:scale-105 transition-transform duration-500"}
                                                />

                                                {!isGrid && rankingBadge}

                                                <div className={`absolute inset-0 ${isGrid ? 'bg-black/60' : 'bg-black/40'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20`}>
                                                    <div className={isGrid ? "w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 scale-90 group-hover:scale-100 transition-transform duration-300" : ""}>
                                                        <Play className={`${isGrid ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} fill-white ml-0.5`} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info Section */}
                                            <div className={isGrid ? "px-0.5 sm:px-1" : "flex flex-col justify-center gap-2 sm:gap-3 min-w-0 p-0 sm:pr-20"}>
                                                <h3 className={`text-white font-bold truncate transition-colors ${isGrid ? 'text-xs sm:text-sm line-clamp-2' : 'text-xl sm:text-2xl text-wrap'
                                                    }`}>
                                                    {show.name}
                                                </h3>
                                                {isGrid &&
                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                                                        {show.vote_average > 0 && (
                                                            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-white/10">
                                                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                                                <span className="text-white text-[10px] font-bold">
                                                                    {show.vote_average.toFixed(1)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {show.initialDbState.userRating > 0 && (
                                                            <div className="flex w-fit items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/20 text-blue-400">
                                                                <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-blue-400 text-blue-400" />
                                                                <span className="text-white text-[10px] font-bold">
                                                                    {show.initialDbState.userRating.toFixed(1)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <span className="text-zinc-400 text-[10px]">{show.first_air_date?.slice(0, 4)}</span>
                                                    </div>
                                                }

                                                {!isGrid && (
                                                    <>
                                                        <span className="text-zinc-400 text-[10px] sm:text-sm">{show.first_air_date?.slice(0, 4)}</span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {show.genre_ids.slice(0, 3).map((genreId: number) => (
                                                                <span key={genreId} className='px-1 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[8px] sm:text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md text-zinc-400'>
                                                                    {t('genres', genreId.toString())}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-white/10">
                                                                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-500 text-yellow-500" />
                                                                <span className="text-white text-[10px] sm:text-xs font-bold">
                                                                    {show.vote_average.toFixed(1)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {show.initialDbState.userRating > 0 && (
                                                            <div className="flex w-fit items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/20 text-blue-400">
                                                                <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-blue-400 text-blue-400" />
                                                                <span className="text-white text-[10px] font-bold">
                                                                    {show.initialDbState.userRating.toFixed(1)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <p className="hidden text-zinc-400 text-xs sm:text-sm line-clamp-1 sm:line-clamp-2 max-w-2xl">
                                                            {show.overview}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                                            <div className="flex items-center gap-2 text-[#414141] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                                                                Discover
                                                                <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#292929]" />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </Link>

                                        {controls}
                                        {isGrid && rankingBadge}
                                    </div>
                                );
                            })}
                        </div>

                        <div ref={loaderRef} className="flex justify-center py-10">
                            {hasNextPage ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border-3 border-white/10 border-t-white/30 animate-spin" />
                                    <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Loading...</span>
                                </div>
                            ) : tvData.length > 0 ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-px w-20 bg-white/10" />
                                    <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">End of list</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                            <Filter className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">No TV series found</h3>
                        <p className="text-zinc-500 text-sm max-w-xs">Try adjusting your filters to find what you're looking for.</p>
                        <button
                            onClick={() => { setSelectedGenre('All'); setSelectedYear('All'); }}
                            className="mt-6 text-white text-sm font-semibold underline underline-offset-4 hover:text-zinc-300 cursor-pointer"
                        >
                            Reset filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
