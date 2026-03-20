import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";

export async function getPersonDetails(id: string) {
    const [person, movieCredits, tvCredits] = await Promise.all([
        tmdbFetch(`/person/${id}`, {}, CacheConfig.DETAILS),
        tmdbFetch(`/person/${id}/movie_credits`, {}, CacheConfig.DETAILS),
        tmdbFetch(`/person/${id}/tv_credits`, {}, CacheConfig.LISTS),
    ]);

    return {
        person,
        movieCredits: movieCredits || { cast: [], crew: [] },
        tvCredits: tvCredits || { cast: [], crew: [] },
    };
}
