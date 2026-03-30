import MoviesPage from "@/components/movies/MoviesPage";
import { cookies } from 'next/headers';
import { getAuthSession } from "@/lib/auth-sessions";
import { getMoviesAction } from "@/lib/tmdb/getMovies";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";


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

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MoviesPage initialViewMode={viewMode as 'grid' | 'list'} userId={userId} />
        </HydrationBoundary>
    );
}