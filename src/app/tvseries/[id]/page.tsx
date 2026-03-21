import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTVDetails } from "@/lib/tmdb/getTvSeriesDetails";
import TvSeriesDetail from "@/components/tvseries/TvSeriesDetail";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'


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
    const { id } = await params
    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['tv', id],
        queryFn: () => getTVDetails(id),
    })

    const state = dehydrate(queryClient)

    const tvData = queryClient.getQueryData(['tv', id]) as any
    if (!tvData?.series) {
        notFound()
    }

    return (
        <HydrationBoundary state={state}>
            <TvSeriesDetail tvId={id} />
        </HydrationBoundary>
    )
}