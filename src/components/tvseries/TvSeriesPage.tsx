'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Grid, List, ChevronLeft } from "lucide-react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { updateViewMode } from "@/lib/tmdb/cookies-actions"
import { getTVSeriesAction } from "@/lib/tmdb/getTvSeries"
import { useTranslation } from "@/providers/LocaleProvider"
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig"
import TvSeriesPageList from "@/components/tvseries/TvSeriesPageList"
import GenreCard from "@/components/movies/GenreCard"
import { getGenresAction } from "@/lib/tmdb/getGenres"


// Survives client-side navigation — only resets on full page reload
let _tvScrollY = 0

export default function TvSeriesPage({ initialViewMode, userId }: { initialViewMode: 'grid' | 'list', userId: string }) {
    const { t, locale } = useTranslation();
    const tmdbLang = TMDB_LANGUAGES[locale as Locale];
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);

    const genreId = searchParams.get('genreId') || "";
    const isGenreSelected = !!genreId;



    const [activeCategory, setActiveCategory] = useState<'popular' | 'topRated' | 'genres'>(() => {
        const urlCategory = searchParams.get('category') as 'popular' | 'topRated' | 'genres';
        if (['popular', 'topRated', 'genres'].includes(urlCategory)) return urlCategory;
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
        queryKey: ['series-list', activeCategory, tmdbLang, genreId],
        queryFn: async ({ pageParam = 1 }) => {
            const result = await getTVSeriesAction(activeCategory, pageParam.toString(), userId, tmdbLang, genreId);
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

    const { data: genresResponse, isLoading: isLoadingGenres } = useQuery({
        queryKey: ['genres-list', tmdbLang, activeCategory],
        queryFn: () => getGenresAction('tv', tmdbLang),
        enabled: activeCategory === 'genres',
        staleTime: 1000 * 60 * 30,
    });

    const genres = genresResponse?.data || [];

    const handleGenreSelect = (id: number) => {
        // setSelectedGenreId(id);
        const params = new URLSearchParams(searchParams.toString());
        params.set('genreId', id.toString());
        router.push(pathname + '?' + params.toString(), { scroll: true });
    };

    const tvData = useMemo(() => {
        return data?.pages.flatMap((page) => page.results) || [];
    }, [data]);

    const handleItemClick = useCallback(() => {
        _tvScrollY = window.scrollY;
    }, []);


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
        const urlCategory = searchParams.get('category') as 'popular' | 'topRated' | 'genres';
        if (urlCategory && ['popular', 'topRated', 'genres'].includes(urlCategory) && urlCategory !== activeCategory) {
            setActiveCategory(urlCategory);
        }
    }, [searchParams]);

    // Update URL when category changes
    const handleCategoryChange = (key: 'popular' | 'topRated' | 'genres') => {
        setActiveCategory(key);
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', key);
        params.delete('genreId');
        router.push(pathname + '?' + params.toString(), { scroll: false });
    };

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('seriesCategory', activeCategory)
    }, [activeCategory]);

    useEffect(() => {
        localStorage.setItem('seriesViewMode', viewMode)
    }, [viewMode]);

    // Infinite scroll is now handled internally by TvSeriesPageList virtualization

    const categories = [
        { key: 'popular', label: t('categories', 'popular') },
        { key: 'topRated', label: t('categories', 'topRated') },
        { key: 'genres', label: t('categories', 'genres') },
    ]


    return (
        <div className="pt-20 min-h-screen">
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-2">
                <h1 className="text-3xl sm:text-5xl font-bold mb-5">{genreId ? t('common', 'genre') : t('nav', 'tvseries')}: {genreId ? t('genres', genreId) : t('categories', activeCategory)}</h1>

                {isGenreSelected && (
                    <button
                        onClick={() => handleCategoryChange('genres')}
                        className="group mb-2 flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-lg transition-all duration-300 cursor-pointer active:scale-95"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors">
                            {t('common', 'backToGenres')}
                        </span>
                    </button>
                )}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-8">
                    <div className="flex items-center gap-1 w-full sm:w-fit bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1 overflow-x-auto no-scrollbar">
                        {categories.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => handleCategoryChange(key as 'popular' | 'topRated' | 'genres')}
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



                {activeCategory === 'genres' && !isGenreSelected && (
                    /* Genre Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-20">
                        {genres.map((genre, idx) => (
                            <GenreCard
                                key={genre.id}
                                genreId={genre.id}
                                genreName={t('genres', genre.id)}
                                genreBackDrop={genre.backdrop_path}
                                idx={idx}
                                onClick={handleGenreSelect}
                            />
                        ))}
                    </div>
                )}

                {/* ─── TV SERIES CONTENT ─── */}
                {(activeCategory !== 'genres' || isGenreSelected) && (
                    <TvSeriesPageList
                        status={status}
                        tvData={tvData}
                        viewMode={viewMode}
                        activeCategory={activeCategory}
                        userId={userId}
                        handleItemClick={handleItemClick}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                        t={t}
                        setActiveCategory={setActiveCategory}
                    />
                )}


            </div>
        </div>
    )
}
