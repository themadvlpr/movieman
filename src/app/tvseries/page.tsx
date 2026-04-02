import TvSeriesPage from "@/components/tvseries/TvSeriesPage"
import { cookies } from 'next/headers';
import { getAuthSession } from "@/lib/auth-sessions";
import { getTVSeriesAction } from "@/lib/tmdb/getTvSeries"
import { dehydrate, HydrationBoundary, QueryClient, DehydratedState } from "@tanstack/react-query";

export const metadata = {
    title: "TV Series | MovieMan",
    description:
        "Discover the most popular TV series trending right now. Watch trailers and explore cast information on MovieMan.",
    openGraph: {
        title: "TV Series | MovieMan",
        description: "Discover the most popular TV series trending right now.",
    },
};

export default async function SeriesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const cookieStore = await cookies();
    const viewMode = cookieStore.get('tvseriesViewMode')?.value || 'grid';

    const { category = 'popular' } = await searchParams;
    const session = await getAuthSession();
    const userId = session?.user?.id || "";

    const queryClient = new QueryClient();

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['series-list', category],
        queryFn: async () => {
            const res = await getTVSeriesAction(category as any, "1", userId);
            return res.success ? res.data : null;
        },
        initialPageParam: 1,
    });

    // Set dataUpdatedAt = 1 to prevent client-side cache being overwritten on return visits
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