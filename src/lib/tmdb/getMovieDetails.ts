import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";

export async function getMovieDetails(id: string, language = "en-US") {
    const [movie, credits, similarMovies] = await Promise.all([
        tmdbFetch(`/movie/${id}`, { append_to_response: 'videos', language }, CacheConfig.DETAILS),
        tmdbFetch(`/movie/${id}/credits`, { language }, CacheConfig.DETAILS),
        tmdbFetch(`/movie/${id}/recommendations`, { language }, CacheConfig.LISTS),
    ]);

    return {
        movie,
        credits: credits || { cast: [], crew: [] },
        similarMovies: similarMovies?.results || [],
    };
}