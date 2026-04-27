import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { getUserMediaStatus } from "@/lib/db/getUserMediaStatus";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export async function searchMedia(
    query: string,
    userId: string | undefined,
    page = "1",
    language = "en-US"
) {
    try {
        const data = await tmdbFetch(
            "/search/multi",
            { query, page, language, include_adult: "false" },
            CacheConfig.SEARCH
        );

        if (!data?.results) return { results: [], total_pages: 0, page: 1 };

        // Filter for movies and tv series only
        const filteredResults = data.results.filter(
            (item: any) => item.media_type === "movie" || item.media_type === "tv"
        );

        const movieIds = filteredResults.filter((i: any) => i.media_type === "movie").map((i: any) => i.id);
        const tvIds = filteredResults.filter((i: any) => i.media_type === "tv").map((i: any) => i.id);

        // Fetch genre maps for movies and tv
        const [movieGenres, tvGenres] = await Promise.all([
            tmdbFetch("/genre/movie/list", { language }, CacheConfig.STATIC),
            tmdbFetch("/genre/tv/list", { language }, CacheConfig.STATIC),
        ]);

        const genreMap = new Map<number, string>();
        (movieGenres?.genres || []).forEach((g: any) => genreMap.set(g.id, g.name));
        (tvGenres?.genres || []).forEach((g: any) => genreMap.set(g.id, g.name));

        const [detailsArr, movieStatuses, tvStatuses] = await Promise.all([
            Promise.all(
                filteredResults.map(async (item: any) => {
                    try {
                        const type = item.media_type;
                        const details = await tmdbFetch(
                            `/${type}/${item.id}`,
                            { language },
                            CacheConfig.DETAILS
                        );
                        return {
                            id: item.id,
                            tagline: details?.tagline || "",
                            release_date: type === "movie"
                                ? details?.release_date
                                : details?.first_air_date,
                            genres: (details?.genres || []).map((g: any) => g.name) as string[],
                        };
                    } catch {
                        return { id: item.id, tagline: "", release_date: "", genres: [] };
                    }
                })
            ),
            userId && movieIds.length > 0
                ? getUserMediaStatus(userId, movieIds, "movie")
                : Promise.resolve({} as Record<number, any>),
            userId && tvIds.length > 0
                ? getUserMediaStatus(userId, tvIds, "tv")
                : Promise.resolve({} as Record<number, any>)
        ]);

        const results = filteredResults.map((item: any) => {
            const det = detailsArr.find(d => d.id === item.id);
            const type = item.media_type;
            const status = type === "movie" ? movieStatuses[item.id] : tvStatuses[item.id];

            return {
                id: item.id,
                type,
                title: type === "movie" ? item.title : item.name,
                poster: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : null,
                vote_average: item.vote_average || 0,
                tagline: det?.tagline || "",
                release_year: det?.release_date
                    ? new Date(det.release_date).getFullYear()
                    : null,
                genre_names: det?.genres?.length
                    ? det.genres
                    : (item.genre_ids || []).map((id: number) => genreMap.get(id)).filter(Boolean),
                initialDbState: {
                    userRating: status?.userRating || 0,
                    isWatched: !!status?.isWatched,
                    isWishlist: !!status?.isWishlist,
                    isFavorite: !!status?.isFavorite,
                },
            };
        });

        return { results, total_pages: data.total_pages, page: data.page };

    } catch (error) {
        console.error(`Error in searchMedia (${query}):`, error);
        return { results: [], total_pages: 0, page: 1 };
    }
}
