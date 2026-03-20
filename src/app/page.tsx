import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import MainPage from "@/components/MainPage"
import { getDiscoverMovies } from "@/lib/tmdb/getDiscoverMovies"
import { cookies } from 'next/headers'

export default async function Home() {
    const queryClient = new QueryClient()
    const cookieStore = await cookies();
    const genreStr = cookieStore.get('selectedGenreId')?.value || "28";
    const genreId = parseInt(genreStr, 10);

    await queryClient.prefetchQuery({
        queryKey: ['discovermovies', genreId],
        queryFn: () => getDiscoverMovies(genreStr),
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MainPage initialGenreId={genreId} />
        </HydrationBoundary>
    )
}