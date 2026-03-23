import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { getMovieDetails } from "@/lib/tmdb/getMovieDetails";
import MovieDetail from "@/components/movies/MovieDetail";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getAuthSession } from "@/lib/auth-sessions";

interface MoviePageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
    const { id } = await params;
    const movie = await tmdbFetch(`/movie/${id}`, {}, CacheConfig.DETAILS);

    if (!movie) {
        return {
            title: "Movie Not Found | MovieMan",
        };
    }

    return {
        title: `${movie.title} | MovieMan`,
        description: movie.overview,
    };
}

export default async function MoviePage({ params }: MoviePageProps) {
    const { id } = await params
    const session = await getAuthSession();
    const userId = session?.user?.id;

    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['movie', id],
        queryFn: () => getMovieDetails(id),
    })

    const state = dehydrate(queryClient)

    const movieData = queryClient.getQueryData(['movie', id]) as any
    if (!movieData?.movie) {
        notFound()
    }

    return (
        <HydrationBoundary state={state}>
            <MovieDetail movieId={id} userId={userId || ""} />
        </HydrationBoundary>
    )
}