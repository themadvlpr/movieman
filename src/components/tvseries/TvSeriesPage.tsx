'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { updateViewMode } from "@/lib/tmdb/cookies-actions"
import { getTVSeriesAction } from "@/lib/tmdb/getTvSeries"
import { useTranslation } from "@/providers/LocaleProvider"
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig"
import { getGenresAction } from "@/lib/tmdb/getGenres"
import MediaPageLayout from "@/components/movie-tv/MediaPageLayout"


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

    const categoryFromUrl = searchParams.get('category') || 'popular';

    const activeCategory = useMemo(() => {
        if (categoryFromUrl === 'top_rated' || categoryFromUrl === 'topRated') return 'topRated';
        return categoryFromUrl as 'popular' | 'topRated' | 'genres';
    }, [categoryFromUrl]);

    const [categoryStyle, setCategoryStyle] = useState<'popular' | 'topRated' | 'genres'>(searchParams.get('category') as 'popular' | 'topRated' | 'genres' || 'popular');


    const toggleView = useCallback(async (mode: 'grid' | 'list') => {
        const newMode = mode === 'grid' ? 'list' : 'grid';
        setViewMode(newMode);
        await updateViewMode(newMode, 'tvseries');
    }, []);


    // Update URL when category changes
    const handleCategoryChange = useCallback((key: 'popular' | 'topRated' | 'genres') => {
        setCategoryStyle(key);
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', key);
        params.delete('genreId');
        router.push(pathname + '?' + params.toString(), { scroll: false });
    }, [searchParams, pathname, router]);

    const categories = useMemo(() => [
        { key: 'popular', label: t('categories', 'popular') },
        { key: 'topRated', label: t('categories', 'topRated') },
        { key: 'genres', label: t('categories', 'genres') },
    ], [t]);

    const handleGenreSelect = useCallback((id: number) => {
        // setSelectedGenreId(id);
        const params = new URLSearchParams(searchParams.toString());
        params.set('genreId', id.toString());
        router.push(pathname + '?' + params.toString(), { scroll: true });
    }, [searchParams, pathname, router]);

    const handleItemClick = useCallback(() => {
        _tvScrollY = window.scrollY;
    }, []);

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
        staleTime: 1000 * 60 * 5, // 5 minutes to keep it snappy
        refetchOnMount: false, // Don't refetch on mount if we have data
    })

    const tvData = useMemo(() => {
        return data?.pages.flatMap((page) => page.results) || [];
    }, [data]);


    const { data: genresResponse, isLoading: isLoadingGenres } = useQuery({
        queryKey: ['genres-list', tmdbLang, activeCategory, 'tv'],
        queryFn: () => getGenresAction('tv', tmdbLang),
        enabled: activeCategory === 'genres',
        staleTime: 1000 * 60 * 30,
    });

    const genres = genresResponse?.data || [];

    // Sync state with URL


    // Sync state with URL
    useEffect(() => {
        const urlCategory = searchParams.get('category');
        let newCategory: 'popular' | 'topRated' | 'genres' = 'popular';

        if (urlCategory === 'top_rated' || urlCategory === 'topRated') newCategory = 'topRated';
        else if (urlCategory === 'genres') newCategory = 'genres';
        else newCategory = 'popular';
    }, [searchParams, activeCategory]);



    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('seriesCategory', activeCategory)
    }, [activeCategory]);

    useEffect(() => {
        localStorage.setItem('seriesViewMode', viewMode)
    }, [viewMode]);




    return (
        <MediaPageLayout
            key="tvseries-page"
            type="tvseries"
            mediaData={tvData}
            viewMode={viewMode}
            activeCategory={activeCategory}
            genreId={genreId}
            isGenreSelected={isGenreSelected}
            isLoadingGenres={isLoadingGenres}
            genres={genres}
            categories={categories}
            status={status}
            userId={userId}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            t={t}
            handleCategoryChange={handleCategoryChange}
            handleGenreSelect={handleGenreSelect}
            toggleView={toggleView}
            handleItemClick={handleItemClick}
            fetchNextPage={fetchNextPage}
            categoryStyle={categoryStyle}
            restoreScrollOffset={_tvScrollY}
            onScrollRestored={() => { _tvScrollY = 0 }}
        />
    )
}
