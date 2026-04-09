'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Play, Grid, List, Filter, ChevronLeft } from "lucide-react"
import { useInfiniteQuery, useQuery, keepPreviousData } from "@tanstack/react-query"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { updateViewMode } from "@/lib/tmdb/cookies-actions"
import { getMoviesAction } from "@/lib/tmdb/getMovies"
import { getGenresAction } from "@/lib/tmdb/getGenres"
import MovieCard from "@/components/movies/MovieCard"
import GenreCard from "@/components/movies/GenreCard"
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

    const [activeCategory, setActiveCategory] = useState<'popular' | 'topRated' | 'upcoming' | 'genres'>(() => {
        const urlCategory = searchParams.get('category') as 'popular' | 'topRated' | 'upcoming' | 'genres';
        if (['popular', 'topRated', 'upcoming', 'genres'].includes(urlCategory)) return urlCategory;
        return 'popular';
    })

    const [selectedGenreId, setSelectedGenreId] = useState<number | null>(() => {
        const urlGenreId = searchParams.get('genreId');
        return urlGenreId ? parseInt(urlGenreId) : null;
    });

    const { data: genresResponse, isLoading: isGenresLoading, isRefetching: isGenresRefetching } = useQuery({
        queryKey: ['genres-list', tmdbLang],
        queryFn: () => getGenresAction(tmdbLang),
        enabled: activeCategory === 'genres',
        staleTime: 1000 * 60 * 60, // 1 hour
        placeholderData: keepPreviousData,
    });

    const genres = genresResponse?.data || [];
    const selectedGenreName = genres.find(g => g.id === selectedGenreId)?.name;


    const toggleView = async (mode: 'grid' | 'list') => {
        const newMode = mode === 'grid' ? 'list' : 'grid'
        setViewMode(newMode)
        await updateViewMode(newMode, 'movies')
    }


    // Sync state with URL if it changes (e.g. back button)
    useEffect(() => {
        const urlCategory = searchParams.get('category') as 'popular' | 'topRated' | 'upcoming' | 'genres';
        if (urlCategory && ['popular', 'topRated', 'upcoming', 'genres'].includes(urlCategory) && urlCategory !== activeCategory) {
            setActiveCategory(urlCategory);
        }

        const urlGenreId = searchParams.get('genreId');
        const parsedGenreId = urlGenreId ? parseInt(urlGenreId) : null;
        if (parsedGenreId !== selectedGenreId) {
            setSelectedGenreId(parsedGenreId);
        }
    }, [searchParams, activeCategory, selectedGenreId]);

    // Update URL when category changes
    const handleCategoryChange = (key: 'popular' | 'topRated' | 'upcoming' | 'genres') => {
        setActiveCategory(key);
        if (key !== 'genres') {
            setSelectedGenreId(null);
        }
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', key);
        if (key !== 'genres') {
            params.delete('genreId');
        }
        router.push(pathname + '?' + params.toString(), { scroll: false });
    };

    const handleGenreSelect = (id: number) => {
        setSelectedGenreId(id);
        const params = new URLSearchParams(searchParams.toString());
        params.set('genreId', id.toString());
        router.push(pathname + '?' + params.toString(), { scroll: false });
    };

    const handleBackToGenres = () => {
        setSelectedGenreId(null);
        const params = new URLSearchParams(searchParams.toString());
        params.delete('genreId');
        router.push(pathname + '?' + params.toString(), { scroll: false });
    };


    const loaderRef = useRef<HTMLDivElement>(null)

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        isPlaceholderData,
    } = useInfiniteQuery({
        queryKey: ['movies-list', activeCategory, selectedGenreId, tmdbLang],
        queryFn: async ({ pageParam = 1 }) => {
            const categoryToFetch = activeCategory === 'genres' && selectedGenreId
                ? `genre-${selectedGenreId}`
                : activeCategory;

            const result = await getMoviesAction(categoryToFetch, userId, pageParam.toString(), tmdbLang);

            if (!result.success) throw new Error(result.error);

            return result.data;
        },
        enabled: activeCategory !== 'genres' || !!selectedGenreId,
        getNextPageParam: (lastPage) => {
            if (lastPage && lastPage.page < lastPage.total_pages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 30, // 30 seconds
        refetchOnMount: "always",
        placeholderData: keepPreviousData,
    });

    const isInternalLoading = status === 'pending' && !data;
    const isFetchingNewCategory = isPlaceholderData;

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
        { key: 'genres', label: t('categories', 'genres') },
    ]

    return (
        <div className="pt-20 min-h-screen">
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-2">
                {/* ─── HEADER ─── */}
                <div className="flex flex-col gap-2 mb-6 min-h-[100px] justify-center">
                    <h1 className="text-3xl sm:text-5xl font-bold transition-all duration-300">
                        {t('nav', 'movies')}: {selectedGenreId && activeCategory === 'genres' ? selectedGenreName : t('categories', activeCategory)}
                    </h1>
                    <div className="h-6 sm:h-8 flex items-center">
                        {activeCategory === 'genres' && selectedGenreId && (
                            <button
                                onClick={handleBackToGenres}
                                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer group w-fit animate-in fade-in slide-in-from-left-2 duration-300"
                            >
                                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                <span className="text-sm font-medium uppercase tracking-widest">{t('categories', 'genres')}</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-8">
                    {/* Categories */}
                    <div className="flex items-center gap-1 w-full sm:w-fit bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1 overflow-x-auto no-scrollbar">
                        {categories.map(({ key }) => (
                            <button
                                key={key}
                                onClick={() => handleCategoryChange(key as 'popular' | 'topRated' | 'upcoming' | 'genres')}
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
                                className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => toggleView('grid')}
                                className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── MAIN CONTENT ─── */}
                <div className="relative min-h-[400px]">
                    {/* Loading Overlay (only for initial or full category changes) */}
                    {((isGenresLoading && !genres.length) || isInternalLoading) && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center py-40 bg-black/10 backdrop-blur-[2px] transition-all duration-500">
                            <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
                        </div>
                    )}

                    {/* Content Layer */}
                    <div className={`transition-all duration-500 ${(isGenresLoading && !genres.length) || isInternalLoading ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
                        {activeCategory === 'genres' && !selectedGenreId ? (
                            /* Genre Grid */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-20">
                                {genres.map((genre, idx) => (
                                    <GenreCard
                                        key={genre.id}
                                        genre={genre}
                                        idx={idx}
                                        onClick={handleGenreSelect}
                                    />
                                ))}
                            </div>
                        ) : moviesData.length > 0 ? (
                            /* Movie List/Grid */
                            <div className="flex flex-col gap-10">
                                <div
                                    className={`${viewMode === 'grid'
                                        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
                                        : "flex flex-col gap-3 sm:gap-4"} transition-opacity duration-500 ${isPlaceholderData ? 'opacity-40' : 'opacity-100'}`}
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
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-px w-20 bg-white/10" />
                                            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">{t('common', 'endOfList')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : !isInternalLoading && (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                    <Filter className="w-8 h-8 text-zinc-600" />
                                </div>
                                <h3 className="text-white text-xl font-bold mb-2">{t('common', 'noResults')}</h3>
                                <p className="text-zinc-500 text-sm max-w-xs">{t('common', 'tryAdjustingYourFilters').slice(0, -5)}</p>
                                <button
                                    onClick={() => {
                                        setActiveCategory('popular');
                                        setSelectedGenreId(null);
                                    }}
                                    className="mt-6 text-white text-sm font-semibold underline underline-offset-4 hover:text-zinc-300 cursor-pointer"
                                >
                                    {t('common', 'resetFilters')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

