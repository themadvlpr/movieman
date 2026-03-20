import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { getMovieDetails } from "@/lib/tmdb/getMovieDetails";
import MovieDetail from "@/components/movies/MovieDetail";
import { notFound } from "next/navigation";
import { Metadata } from "next";

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
    const { id } = await params;
    const { movie, credits, similarMovies } = await getMovieDetails(id);

    if (!movie) {
        notFound();
    }

    return (
        <MovieDetail
            movie={movie}
            credits={credits}
            similarMovies={similarMovies}
        />
    )
}