import MoviesPage from "@/components/movies/MoviesPage";
import { cookies } from 'next/headers';
import { getAuthSession } from "@/lib/auth-sessions";
import { getMoviesAction } from "@/lib/tmdb/getMovies";
import { dehydrate, HydrationBoundary, QueryClient, DehydratedState } from "@tanstack/react-query";


export const metadata = {
    title: "Movies | MovieMan",
    description:
        "Discover the most popular movies trending right now. Watch trailers and explore cast information on MovieMan.",
    openGraph: {
        title: "Movies | MovieMan",
        description: "Discover the most popular movies trending right now.",
    },
};


export default async function Movies({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const cookieStore = await cookies();
    const viewMode = cookieStore.get('moviesViewMode')?.value || 'grid';

    const { category = 'popular' } = await searchParams;
    const session = await getAuthSession();
    const userId = session?.user?.id || "";

    const queryClient = new QueryClient();

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['movies-list', category],
        queryFn: async () => {
            const res = await getMoviesAction(category, userId, "1");
            return res.success ? res.data : null;
        },
        initialPageParam: 1,
    });

    // Set dataUpdatedAt = 1 on all server-prefetched queries.
    // This ensures HydrationBoundary NEVER overwrites an existing client cache
    // (client data fetched at Date.now() >> 1).
    // On the very first visit the client has dataUpdatedAt = 0, so 0 < 1 → server data IS applied.
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