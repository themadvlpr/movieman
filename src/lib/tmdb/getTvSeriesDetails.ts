import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";

export async function getTVDetails(id: string) {
    const [series, credits, recommendations] = await Promise.all([
        tmdbFetch(`/tv/${id}`, {}, CacheConfig.DETAILS),
        tmdbFetch(`/tv/${id}/credits`, {}, CacheConfig.DETAILS),
        tmdbFetch(`/tv/${id}/recommendations`, {}, CacheConfig.LISTS),
    ]);

    return {
        series,
        credits: credits || { cast: [], crew: [] },
        similarSeries: recommendations?.results || [],
    };
}