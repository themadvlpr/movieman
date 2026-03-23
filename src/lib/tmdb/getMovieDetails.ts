import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";

export async function getMovieDetails(id: string) {
    const [movie, credits, similarMovies] = await Promise.all([
        tmdbFetch(`/movie/${id}`, {}, CacheConfig.DETAILS),
        tmdbFetch(`/movie/${id}/credits`, {}, CacheConfig.DETAILS),
        tmdbFetch(`/movie/${id}/recommendations`, {}, CacheConfig.LISTS),
    ]);

    return {
        movie,
        credits: credits || { cast: [], crew: [] },
        similarMovies: similarMovies?.results || [],
    };
}