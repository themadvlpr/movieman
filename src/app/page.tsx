import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import MainPage from "@/components/MainPage"
import { getDiscoverMovies } from "@/lib/tmdb/getDiscoverMovies"
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import Loader from '@/components/ui/Loader'

async function MainContent({ searchParams }: { searchParams: { genre?: string } }) {
    const queryClient = new QueryClient()
    const cookieStore = await cookies();

    // Prioritize URL search param over cookie
    const genreStr = searchParams.genre || cookieStore.get('selectedGenreId')?.value || "28";
    const genreId = parseInt(genreStr, 10);

    await queryClient.prefetchQuery({
        queryKey: ['discovermovies', genreId],
        queryFn: () => getDiscoverMovies(genreId.toString()),
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MainPage initialGenreId={genreId} />
        </HydrationBoundary>
    )
}

export default async function Home({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
    const resolvedSearchParams = await searchParams;

    return (
        <Suspense fallback={<Loader />}>
            <MainContent searchParams={resolvedSearchParams} />
        </Suspense>
    )
}