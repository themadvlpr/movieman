import MoviesPage from "@/components/movies/MoviesPage";
import { cookies } from 'next/headers';
import { getAuthSession } from "@/lib/auth-sessions";
import { getMoviesAction } from "@/lib/tmdb/getMovies";
import { dehydrate, HydrationBoundary, QueryClient, DehydratedState } from "@tanstack/react-query";
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig";
import { Metadata } from "next";
import { translations } from "@/lib/i18n/translation";
import { Suspense } from "react";
import MediaPageSkeleton from "@/components/movie-tv/MediaPageSkeleton";

export async function generateMetadata({
    params,
    searchParams
}: {
    params: Promise<{ locale: Locale }>
    searchParams: Promise<{ category?: string, genreId?: string }>
}): Promise<Metadata> {
    const [{ category, genreId }, { locale }] = await Promise.all([searchParams, params]);

    const dict = translations[locale] || translations.en;

    if (!category) {
        return {
            title: `${dict.nav.movies} | MovieMan`,
        };
    }

    let titlePart = "";

    if (category === 'genres' && genreId) {
        titlePart = dict.genres[Number(genreId) as keyof typeof dict.genres]
            || dict.categories.genres;
    }
    else {
        titlePart = dict.categories[category as keyof typeof dict.categories]
            || category;
    }

    return {
        title: `${dict.common.movies}: ${titlePart} | MovieMan`,
        description: dict.about.metaMoviesDestiption,
    };
}


export default async function Movies({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ category?: string }> }) {
    const cookieStore = await cookies();
    const viewMode = cookieStore.get('moviesViewMode')?.value || 'grid';

    return (
        <Suspense fallback={<MediaPageSkeleton viewMode={viewMode as 'grid' | 'list'} />}>
            <MoviesContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}

async function MoviesContent({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ category?: string }> }) {
    const [resolvedSearchParams, resolvedParams, cookieStore, session] = await Promise.all([
        searchParams,
        params,
        cookies(),
        getAuthSession()
    ]);

    const { category = 'popular' } = resolvedSearchParams;
    const { locale } = resolvedParams;
    const userId = session?.user?.id || "";
    const tmdbLang = TMDB_LANGUAGES[locale as Locale];
    const viewMode = cookieStore.get('moviesViewMode')?.value || 'grid';

    const queryClient = new QueryClient();

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['movies-list', category],
        queryFn: async () => {
            const res = await getMoviesAction(category, userId, "1", tmdbLang);
            return res.success ? res.data : null;
        },
        initialPageParam: 1,
    });

    const serverState: DehydratedState = dehydrate(queryClient);

    serverState.queries.forEach((query) => {
        (query.state as { dataUpdatedAt: number }).dataUpdatedAt = 1;
    });

    return (
        <HydrationBoundary state={serverState}>
            <MoviesPage initialViewMode={viewMode as 'grid' | 'list'} userId={userId} />
        </HydrationBoundary>
    );
}