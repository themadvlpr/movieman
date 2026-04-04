"use server";

import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { Movie } from "@/lib/tmdb/types/tmdb-types";
import { getUserMediaStatus } from "@/lib/db/getUserMediaStatus";
import { dbMediaStatus } from "./types/db-types";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";


interface TMDBParams {
    page: string;
    [key: string]: string | number | undefined;
}

export async function getMoviesAction(category: string = "popular", userId: string | null, page: string = "1", language = "en-US") {
    try {
        let endpoint = '/movie/popular';
        let params: TMDBParams = { page, language };

        if (category === 'topRated') {
            endpoint = '/movie/top_rated';
        } else if (category === 'upcoming') {
            endpoint = '/discover/movie';
            const today = new Date().toISOString().split('T')[0];
            params = {
                page,
                'primary_release_date.gte': today,
                'sort_by': 'popularity.desc',
                'with_release_type': '2|3'
            };
        }

        const data = await tmdbFetch(endpoint, params, CacheConfig.LISTS);
        if (!data || !data.results) throw new Error("Failed to fetch movies from TMDB");

        const movieIds = data.results.map((m: Movie) => m.id);

        const dbStatuses: Record<string, dbMediaStatus> = userId
            ? await getUserMediaStatus(userId, movieIds, "movie")
            : {};

        const enhancedResults = data.results.map((movie: Movie) => {
            const status = dbStatuses[movie.id];

            return {
                ...movie,
                poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
                initialDbState: {
                    userRating: status?.userRating,
                    isWatched: !!status?.isWatched,
                    isWishlist: !!status?.isWishlist,
                    isFavorite: !!status?.isFavorite,
                }
            };
        });

        return {
            success: true,
            data: { ...data, results: enhancedResults }
        };

    } catch (error: unknown) {
        console.error("Error in getMoviesAction:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}