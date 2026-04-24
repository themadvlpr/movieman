import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { getUserMediaStatus } from "@/lib/db/getUserMediaStatus";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export async function getDiscoverMedia(
    type: "movie" | "tv",
    genreId: string,
    userId: string | undefined,
    page = "1",
    language = "en-US"
) {
    try {
        const endpoint = type === "movie" ? "/discover/movie" : "/discover/tv";
        const data = await tmdbFetch(
            endpoint,
            { with_genres: genreId, page, sort_by: "popularity.desc", language },
            CacheConfig.LISTS
        );

        if (!data?.results) return { results: [], total_pages: 0, page: 1 };

        const mediaIds = data.results.map((item: any) => item.id);

        // Fetch genre list once (for ID->name mapping)
        const genreListEndpoint = type === "movie" ? "/genre/movie/list" : "/genre/tv/list";
        const genreListData = await tmdbFetch(genreListEndpoint, { language }, CacheConfig.STATIC);
        const genreMap = new Map<number, string>(
            (genreListData?.genres || []).map((g: any) => [g.id, g.name])
        );

        const [detailsArr, dbStatuses] = await Promise.all([
            // Fetch details for genre names and tagline for each item
            Promise.all(
                data.results.map(async (item: any) => {
                    try {
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
            userId
                ? getUserMediaStatus(userId, mediaIds, type)
                : Promise.resolve({} as Record<number, any>)
        ]);

        const results = data.results.map((item: any) => {
            const det = detailsArr.find(d => d.id === item.id);
            const status = (dbStatuses as Record<number, any>)[item.id];

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
        console.error(`Error in getDiscoverMedia (${type}):`, error);
        return { results: [], total_pages: 0, page: 1 };
    }
}
