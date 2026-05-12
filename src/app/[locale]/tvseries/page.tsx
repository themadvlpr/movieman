import TvSeriesPage from "@/components/tvseries/TvSeriesPage"
import { cookies } from 'next/headers';
import { getAuthSession } from "@/lib/auth-sessions";
import { getTVSeriesAction } from "@/lib/tmdb/getTvSeries"
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
            title: `${dict.nav.tvseries} | MovieMan`,
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
        title: `${dict.common.series}: ${titlePart} | MovieMan`,
        description: dict.about.metaTvSeriesDestiption,
    };
}


export default async function SeriesPage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ category?: string }> }) {
    const cookieStore = await cookies();
    const viewMode = cookieStore.get('tvseriesViewMode')?.value || 'grid';

    return (
        <Suspense fallback={<MediaPageSkeleton viewMode={viewMode as 'grid' | 'list'} />}>
            <SeriesContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}

async function SeriesContent({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ category?: string }> }) {
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
    const viewMode = cookieStore.get('tvseriesViewMode')?.value || 'grid';

    const queryClient = new QueryClient();

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['series-list', category],
        queryFn: async () => {
            const res = await getTVSeriesAction(category as any, "1", userId, tmdbLang);
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
            <TvSeriesPage initialViewMode={viewMode as 'grid' | 'list'} userId={userId} />
        </HydrationBoundary>
    );
}