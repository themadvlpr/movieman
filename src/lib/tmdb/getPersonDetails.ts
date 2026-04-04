import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";

export async function getPersonDetails(id: string, language = "en-US") {
    const [person, movieCredits, tvCredits] = await Promise.all([
        tmdbFetch(`/person/${id}`, { language }, CacheConfig.DETAILS),
        tmdbFetch(`/person/${id}/movie_credits`, { language }, CacheConfig.DETAILS),
        tmdbFetch(`/person/${id}/tv_credits`, { language }, CacheConfig.LISTS),
    ]);

    return {
        person,
        movieCredits: movieCredits || { cast: [], crew: [] },
        tvCredits: tvCredits || { cast: [], crew: [] },
    };
}
