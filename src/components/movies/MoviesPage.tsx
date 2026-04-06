'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Play, Grid, List, Filter, Star } from "lucide-react"
import LibraryControlsButtons from "@/components/ui/LibraryControlsButtons"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { updateViewMode } from "@/lib/tmdb/cookies-actions"
import { getMoviesAction } from "@/lib/tmdb/getMovies"
import Link from "next/link"
import MoviePoster from "@/components/ui/MoviePoster"
import MovieCard from "./MovieCard"
import { useTranslation } from "@/providers/LocaleProvider"
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig"

// Survives client-side navigation — only resets on full page reload
let _moviesScrollY = 0

interface Props {
    initialViewMode: 'grid' | 'list';
    userId: string;
}

export default function MoviesPage({ initialViewMode, userId }: Props) {
    const { t, locale } = useTranslation();
    const tmdbLang = TMDB_LANGUAGES[locale as Locale];
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);

    const [activeCategory, setActiveCategory] = useState<'popular' | 'topRated' | 'upcoming'>(() => {
        const urlCategory = searchParams.get('category') as 'popular' | 'topRated' | 'upcoming';
        if (['popular', 'topRated', 'upcoming'].includes(urlCategory)) return urlCategory;
        return 'popular';
    })


    const toggleView = async (mode: 'grid' | 'list') => {
        const newMode = mode === 'grid' ? 'list' : 'grid'
        setViewMode(newMode)
        await updateViewMode(newMode, 'movies')
    }


    // Sync state with URL if it changes (e.g. back button)
    useEffect(() => {
        const urlCategory = searchParams.get('category') as 'popular' | 'topRated' | 'upcoming';
        if (urlCategory && ['popular', 'topRated', 'upcoming'].includes(urlCategory) && urlCategory !== activeCategory) {
            setActiveCategory(urlCategory);
        }
    }, [searchParams]);

    // Update URL when category changes
    const handleCategoryChange = (key: 'popular' | 'topRated' | 'upcoming') => {
        setActiveCategory(key);
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', key);
        router.push(pathname + '?' + params.toString(), { scroll: false });
    };

    const [selectedGenre, setSelectedGenre] = useState('All')
    const [selectedYear, setSelectedYear] = useState('All')
    const loaderRef = useRef<HTMLDivElement>(null)

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['movies-list', activeCategory, tmdbLang],
        queryFn: async ({ pageParam = 1 }) => {
            const result = await getMoviesAction(activeCategory, userId, pageParam.toString(), tmdbLang);

            if (!result.success) throw new Error(result.error);

            return result.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage && lastPage.page < lastPage.total_pages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 30, // 30 seconds
        refetchOnMount: "always",
    });

    const moviesData = useMemo(() => {
        return data?.pages.flatMap((page) => page?.results || []) || [];
    }, [data]);

    const handleItemClick = useCallback(() => {
        _moviesScrollY = window.scrollY;
    }, []);
    // setTimeout ensures we fire AFTER Next.js’s own scroll-to-top.
    useEffect(() => {
        if (status !== 'success') return
        if (_moviesScrollY <= 0) return

        const y = _moviesScrollY
        _moviesScrollY = 0

        setTimeout(() => {
            window.scrollTo({ top: y, behavior: 'instant' })
        }, 50)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status])


    // Intersection Observer for infinite scroll
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

    // Persist preferences
    useEffect(() => {
        localStorage.setItem('moviesCategory', activeCategory)
    }, [activeCategory]);

    useEffect(() => {
        localStorage.setItem('moviesViewMode', viewMode)
    }, [viewMode]);

    const categories = [
        { key: 'popular', label: t('categories', 'popular') },
        { key: 'topRated', label: t('categories', 'topRated') },
        { key: 'upcoming', label: t('categories', 'upcoming') },
    ]

    return (
        <div className="pt-20 min-h-screen">
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-2">
                <h1 className="text-3xl sm:text-5xl font-bold mb-5">{t('nav', 'movies')}: {t('categories', activeCategory)}</h1>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-8">
                    {/* Categories */}
                    <div className="flex items-center gap-1 w-full sm:w-fit bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1 overflow-x-auto no-scrollbar">
                        {categories.map(({ key }) => (
                            <button
                                key={key}
                                onClick={() => handleCategoryChange(key as 'popular' | 'topRated' | 'upcoming')}
                                className={`relative flex-1 sm:flex-none px-2 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap
                                    ${activeCategory === key
                                        ? 'bg-white text-black shadow-lg shadow-white/10'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <span className="relative z-10">{t('categories', key)}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                        {/* View Toggles */}
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



                {/* ─── MOVIE CONTENT ─── */}
                {status === 'pending' ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
                    </div>
                ) : moviesData.length > 0 ? (
                    <div className="flex flex-col gap-10">
                        <div
                            key={`${activeCategory}-${viewMode}-${selectedGenre}-${selectedYear}`}
                            className={viewMode === 'grid'
                                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
                                : "flex flex-col gap-3 sm:gap-4"}
                            style={{ animation: 'fadeInUp 0.4s ease-out' }}
                        >
                            {moviesData.map((movie, idx) => (
                                <MovieCard
                                    key={`${movie.id}-${idx}`}
                                    movie={movie}
                                    idx={idx}
                                    viewMode={viewMode}
                                    activeCategory={activeCategory}
                                    userId={userId}
                                    onItemClick={handleItemClick}
                                />
                            ))}
                        </div>

                        {/* Infinite Scroll Sentinel */}
                        <div ref={loaderRef} className="flex justify-center py-10">
                            {hasNextPage ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border-3 border-white/10 border-t-white/30 animate-spin" />
                                    <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">{t('common', 'loading')}</span>
                                </div>
                            ) : moviesData.length > 0 ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-px w-20 bg-white/10" />
                                    <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">{t('common', 'endOfList')}</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                            <Filter className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">{t('common', 'noResults')}</h3>
                        <p className="text-zinc-500 text-sm max-w-xs">{t('common', 'tryAdjustingFilters')}</p>
                        <button
                            onClick={() => { setSelectedGenre('All'); setSelectedYear('All'); }}
                            className="mt-6 text-white text-sm font-semibold underline underline-offset-4 hover:text-zinc-300 cursor-pointer"
                        >
                            {t('common', 'resetFilters')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

