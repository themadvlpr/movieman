import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { Metadata } from "next";
import { getTVDetails } from "@/lib/tmdb/getTvSeriesDetails";
import TvSeriesDetail from "@/components/tvseries/TvSeriesDetail";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getAuthSession } from "@/lib/auth-sessions";
import { getMediaState } from "@/lib/db/media-service";

interface TvSeriesPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TvSeriesPageProps): Promise<Metadata> {
    const { id } = await params;
    const series = await tmdbFetch(`/tv/${id}`, {}, CacheConfig.DETAILS);

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
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: ['tv', id],
        queryFn: () => getTVDetails(id),
    });



    if (userId) {
        await queryClient.prefetchQuery({
            queryKey: ["media-state", Number(id), userId],
            queryFn: () => getMediaState(Number(id), userId, "tv"),
        });
    }

    const state = dehydrate(queryClient);

    return (
        <HydrationBoundary state={state}>
            <TvSeriesDetail tvId={id} userId={userId || ""} />
        </HydrationBoundary>
    )
}