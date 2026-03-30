"use server";

import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { Movie } from "./types/tmdb-types";
import { getUserMediaStatus } from "@/lib/db/getUserMediaStatus";
import { dbMediaStatus } from "@/lib/tmdb/types/db-types";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
export async function getDiscoverMovies(genre: string, userId: string, page = "1", language = "en-US") {
    try {
        const data = await tmdbFetch(
            `/discover/movie`,
            { with_genres: genre, page, sort_by: "popularity.desc", language },
            CacheConfig.LISTS
        );

        if (!data?.results) return { results: [], total_pages: 0, page: 1 };

        const movieIds = data.results.map((movie: Movie) => movie.id);

        const [moviesWithDetails, dbStatuses] = await Promise.all([
            Promise.all(
                data.results.map(async (movie: Movie) => {
                    try {
                        const details = await tmdbFetch(
                            `/movie/${movie.id}`,
                            { append_to_response: "images", include_image_language: "en,null", language },
                            CacheConfig.DETAILS
                        );
                        return {
                            id: movie.id,
                            tagline: details?.tagline || "",
                            logo_path: details?.images?.logos?.[0]?.file_path || "",
                            origin_country: details?.production_countries?.[0]?.iso_3166_1 || "",
                        };
                    } catch {
                        return { id: movie.id, tagline: "", logo_path: "", origin_country: "" };
                    }
                })
            ),
            userId
                ? (getUserMediaStatus(userId, movieIds, "movie") as Promise<Record<string, dbMediaStatus>>)
                : Promise.resolve<Record<string, dbMediaStatus>>({})
        ]);

        const moviesWithExtras = data.results.map((movie: Movie) => {
            const details = moviesWithDetails.find(d => d.id === movie.id);

            const status = dbStatuses[movie.id];

            return {
                ...movie,
                poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
                tagline: details?.tagline || "",
                logo_path: details?.logo_path || "",
                origin_country: details?.origin_country || "",
                initialDbState: {
                    isWatched: !!status?.isWatched,
                    isWishlist: !!status?.isWishlist,
                    isFavorite: !!status?.isFavorite,
                }
            };
        });

        return { ...data, results: moviesWithExtras };

    } catch (error) {
        console.error("Error in getDiscoverMovies:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}