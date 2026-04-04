import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";

export async function getTVDetails(id: string, language = "en-US") {
    const [series, credits, recommendations] = await Promise.all([
        tmdbFetch(`/tv/${id}`, { append_to_response: 'videos', language }, CacheConfig.DETAILS),
        tmdbFetch(`/tv/${id}/aggregate_credits`, { language }, CacheConfig.DETAILS),
        tmdbFetch(`/tv/${id}/recommendations`, { language }, CacheConfig.LISTS),
    ]);

    return {
        series,
        credits: credits || { cast: [], crew: [] },
        similarSeries: recommendations?.results || [],
    };
}