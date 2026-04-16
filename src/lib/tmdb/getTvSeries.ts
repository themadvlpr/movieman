"use server";

import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { getUserMediaStatus } from "@/lib/db/getUserMediaStatus";
import { TvSeries } from "./types/tmdb-types";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export async function getTVSeriesAction(
    category: string = "popular",
    page: string = "1",
    userId?: string,
    language = "en-US",
    genreId?: string,
    year?: string
) {
    try {
        let endpoint = "/tv/popular";
        let params: any = { page, language };

        if (category === "topRated" || category === "top_rated") {
            endpoint = "/tv/top_rated";
        }
        else if (category === "genres") {
            endpoint = "/discover/tv";
            params = {
                ...params,
                with_genres: genreId || "",
                sort_by: "popularity.desc",
                ...(year && year !== "all" && { first_air_date_year: year }),
            };
        }

        const data = await tmdbFetch(
            endpoint,
            params,
            CacheConfig.LISTS
        );

        if (!data || !data.results) {
            throw new Error("Failed to fetch TV series from TMDB");
        }

        const tvIds = data.results.map((tv: TvSeries) => tv.id);

        const dbStatuses = userId
            ? await getUserMediaStatus(userId, tvIds, "tv")
            : {};

        const enhancedResults = data.results.map((tv: TvSeries) => {
            const status = dbStatuses[tv.id] || {
                isWatched: false,
                isWishlist: false,
                isFavorite: false
            };

            return {
                ...tv,
                title: tv.name,
                poster: tv.poster_path ? `${TMDB_IMAGE_BASE}${tv.poster_path}` : null,
                initialDbState: {
                    userRating: status?.userRating,
                    isWatched: !!status.isWatched,
                    isWishlist: !!status.isWishlist,
                    isFavorite: !!status.isFavorite,
                    listIds: status?.listIds || []
                }
            };
        });

        return {
            success: true,
            data: { ...data, results: enhancedResults }
        };

    } catch (error: unknown) {
        console.error("Error in getTVSeriesAction:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}