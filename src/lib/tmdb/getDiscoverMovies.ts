import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";

export async function getDiscoverMovies(genre: string, page = "1") {
    const data = await tmdbFetch(
        `/discover/movie`,
        {
            with_genres: genre,
            page,
            sort_by: "popularity.desc",
        },
        CacheConfig.LISTS
    );

    const moviesWithExtras = await Promise.all(
        data.results.map(async (movie: any) => {
            try {
                const details = await tmdbFetch(
                    `/movie/${movie.id}`,
                    {
                        append_to_response: "images",
                        include_image_language: "en,null",
                    },
                    CacheConfig.DETAILS
                );

                const logo_path = details.images?.logos?.[0]?.file_path || "";
                const origin_country =
                    details.production_countries?.[0]?.iso_3166_1 || "";

                return {
                    ...movie,
                    tagline: details.tagline,
                    logo_path,
                    origin_country,
                };
            } catch {
                return {
                    ...movie,
                    tagline: "",
                    logo_path: "",
                    origin_country: "",
                };
            }
        })
    );

    return { ...data, results: moviesWithExtras };
}