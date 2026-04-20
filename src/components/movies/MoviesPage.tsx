'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { updateViewMode } from "@/lib/tmdb/cookies-actions"
import { getMoviesAction } from "@/lib/tmdb/getMovies"
import { getGenresAction } from "@/lib/tmdb/getGenres"
import { useTranslation } from "@/providers/LocaleProvider"
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig"
import MediaPageLayout from "@/components/movie-tv/MediaPageLayout"

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
    const [categoryStyle, setCategoryStyle] = useState<'popular' | 'topRated' | 'upcoming' | 'genres'>(searchParams.get('category') as 'popular' | 'topRated' | 'upcoming' | 'genres' || 'popular');

    const categoryFromUrl = searchParams.get('category') || 'popular';

    const genreId = searchParams.get('genreId') || "";
    const isGenreSelected = !!genreId;

    const activeCategory = useMemo(() => {
        if (categoryFromUrl === 'top_rated' || categoryFromUrl === 'topRated') return 'topRated';
        return categoryFromUrl as 'popular' | 'topRated' | 'upcoming' | 'genres';
    }, [categoryFromUrl]);

    useEffect(() => {
        setCategoryStyle(activeCategory);
    }, [activeCategory]);


    const toggleView = useCallback(async (mode: 'grid' | 'list') => {
        const newMode = mode === 'grid' ? 'list' : 'grid';
        setViewMode(newMode);
        await updateViewMode(newMode, 'movies');
    }, []);


    const handleCategoryChange = useCallback((key: 'popular' | 'topRated' | 'upcoming' | 'genres') => {
        console.log('key', key);

        setCategoryStyle(key);
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', key);
        params.delete('genreId');
        router.push(pathname + '?' + params.toString(), { scroll: false });
    }, [searchParams, pathname, router]);

    const categories = useMemo(() => [
        { key: 'popular', label: t('categories', 'popular') },
        { key: 'topRated', label: t('categories', 'topRated') },
        { key: 'upcoming', label: t('categories', 'upcoming') },
        { key: 'genres', label: t('categories', 'genres') },
    ], [t]);

    const handleGenreSelect = useCallback((id: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('genreId', id.toString());
        router.push(pathname + '?' + params.toString(), { scroll: true });
    }, [searchParams, pathname, router]);

    const handleItemClick = useCallback(() => {
        _moviesScrollY = window.scrollY;
    }, []);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['movies-list', activeCategory, tmdbLang, genreId],
        queryFn: async ({ pageParam = 1 }) => {
            const result = await getMoviesAction(activeCategory, userId, pageParam.toString(), tmdbLang, genreId);

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
        staleTime: 1000 * 60 * 5, // 5 minutes to keep it snappy
        refetchOnMount: false, // Don't refetch on mount if we have data
    });

    const moviesData = useMemo(() => {
        return data?.pages.flatMap((page) => page?.results || []) || [];
    }, [data]);

    const { data: genresResponse, isLoading: isLoadingGenres } = useQuery({
        queryKey: ['genres-list', tmdbLang, activeCategory, 'movie'],
        queryFn: () => getGenresAction('movie', tmdbLang),
        enabled: activeCategory === 'genres',
        staleTime: 1000 * 60 * 30,
    });

    const genres = genresResponse?.data || [];

    // Persist preferences
    useEffect(() => {
        localStorage.setItem('moviesCategory', activeCategory)
    }, [activeCategory]);

    useEffect(() => {
        localStorage.setItem('moviesViewMode', viewMode)
    }, [viewMode]);

    // Sync state with URL if it changes (e.g. back button)
    useEffect(() => {
        const urlCategory = searchParams.get('category');
        let newCategory: 'popular' | 'topRated' | 'upcoming' | 'genres' = 'popular';

        if (urlCategory === 'top_rated' || urlCategory === 'topRated') newCategory = 'topRated';
        else if (urlCategory === 'upcoming') newCategory = 'upcoming';
        else if (urlCategory === 'genres') newCategory = 'genres';
        else newCategory = 'popular';


    }, [searchParams, activeCategory]);


    return (
        <MediaPageLayout
            key="movies-page"
            type="movies"
            mediaData={moviesData}
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
            restoreScrollOffset={_moviesScrollY}
            onScrollRestored={() => { _moviesScrollY = 0 }}
        />
    )
}

