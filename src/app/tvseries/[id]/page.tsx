import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { Metadata } from "next";
import { getTVDetails } from "@/lib/tmdb/getTvSeriesDetails";
import TvSeriesDetail from "@/components/tvseries/TvSeriesDetail";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getAuthSession } from "@/lib/auth-sessions";
import { getUserMediaStatus } from "@/lib/db/getUserMediaStatus";
import { TvSeriesDetailProps } from "@/lib/tmdb/types/tmdb-types";
import { notFound } from "next/navigation";
import { getLocale } from "@/lib/i18n/get-locale";
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig";

interface TvSeriesPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TvSeriesPageProps): Promise<Metadata> {
    const [{ id }, locale] = await Promise.all([params, getLocale()]);
    const tmdbLang = TMDB_LANGUAGES[locale as Locale];
    const series = await tmdbFetch(`/tv/${id}`, { language: tmdbLang }, CacheConfig.DETAILS);

    if (!series) {
        return {
            title: "TV Series Not Found | MovieMan",
        };
    }

    return {
        title: `${series.name} | MovieMan`,
        description: series.overview,
    };
}


export default async function TvSeriesPage({ params }: TvSeriesPageProps) {
    const { id } = await params;
    const session = await getAuthSession();
    const userId = session?.user?.id;
    const locale = await getLocale();
    const tmdbLang = TMDB_LANGUAGES[locale as Locale];
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: ['tv', id],
        queryFn: async () => {
            const tvData = await getTVDetails(id, tmdbLang);
            let dbStatus = { isWatched: false, isWishlist: false, isFavorite: false };

            if (userId) {
                const statuses = await getUserMediaStatus(userId, [Number(id)], "tv");
                if (statuses && statuses[Number(id)]) {
                    dbStatus = statuses[Number(id)];
                }
            }

            return {
                ...tvData,
                initialDbState: dbStatus
            };
        },
    });


    const tvData = queryClient.getQueryData<TvSeriesDetailProps>(['tv', id])
    if (!tvData?.series) {
        notFound()
    }


    const state = dehydrate(queryClient);

    return (
        <HydrationBoundary state={state}>
            <TvSeriesDetail tvId={id} userId={userId || ""} />
        </HydrationBoundary>
    )
}