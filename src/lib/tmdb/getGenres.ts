"use server";

import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";

export async function getGenresAction(type: 'movie' | 'tv' = 'movie', language = "en-US") {
    try {
        const genreEndpoint = type === 'movie' ? `/genre/movie/list` : `/genre/tv/list`;
        const data = await tmdbFetch(genreEndpoint, { language }, CacheConfig.STATIC);

        if (!data || !data.genres) {
            throw new Error(`Failed to fetch ${type} genres from TMDB`);
        }

        const usedBackdrops = new Set<string>();
        const genresWithBackdrops = [];

        for (const genre of data.genres) {
            const discoverEndpoint = type === 'movie' ? `/discover/movie` : `/discover/tv`;

            const contentData = await tmdbFetch(
                discoverEndpoint,
                {
                    with_genres: genre.id,
                    sort_by: "popularity.desc",
                    page: 1,
                    language
                },
                CacheConfig.LISTS
            );

            const items = contentData?.results || [];

            let selectedItem = items.find((m: any) => m.backdrop_path && !usedBackdrops.has(m.backdrop_path));

            if (!selectedItem) {
                selectedItem = items.find((m: any) => m.backdrop_path) || items[0];
            }

            if (selectedItem?.backdrop_path) {
                usedBackdrops.add(selectedItem.backdrop_path);
            }

            genresWithBackdrops.push({
                id: genre.id,
                name: genre.name,
                backdrop_path: selectedItem?.backdrop_path
                    ? `https://image.tmdb.org/t/p/w780${selectedItem.backdrop_path}`
                    : null,
            });
        }

        return {
            success: true,
            data: genresWithBackdrops
        };
    } catch (error: any) {
        console.error(`Error in getGenresAction (${type}):`, error);
        return {
            success: false,
            error: error.message || "An unexpected error occurred"
        };
    }
}