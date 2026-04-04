import { tmdbFetch, CacheConfig, validateParams, createResponse, createErrorResponse } from "@/lib/tmdb/tmdb-api";
import { Movie } from "@/lib/tmdb/types/tmdb-types";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const authHeader = request.headers.get("x-api-key");
        const referer = request.headers.get("referer");

        const isFromMySite = referer && (referer.startsWith("https://movieman.vercel.app") || referer.startsWith("http://localhost:3000"));
        const isBotWithKey = authHeader === process.env.INTERNAL_API_KEY;

        if (!isFromMySite && !isBotWithKey) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }


        const genre = searchParams.get("genre");
        const page = searchParams.get("page") || "1";

        validateParams({ genre }, ["genre"]);

        // 1. List of movies by genre
        const data = await tmdbFetch(
            `/discover/movie`,
            {
                with_genres: genre,
                page,
                sort_by: "popularity.desc"
            },
            CacheConfig.LISTS
        );

        // 2. Fetch taglines for each movie in parallel
        // Use Promise.all to avoid waiting for each movie sequentially
        const moviesWithTaglines = await Promise.all(
            data.results.map(async (movie: Movie) => {
                try {
                    const details = await tmdbFetch(
                        `/movie/${movie.id}`,
                        {
                            append_to_response: "images",
                            include_image_language: "en,null"
                        },
                        CacheConfig.DETAILS
                    );
                    const logo_path = details.images?.logos?.[0]?.file_path || "";
                    const origin_country = details.production_countries?.[0]?.iso_3166_1 || "";
                    return { ...movie, tagline: details.tagline, logo_path, origin_country };
                } catch (e) {
                    return { ...movie, tagline: "", logo_path: "", origin_country: "" };
                }
            })
        );

        // Replace original results with updated ones
        data.results = moviesWithTaglines;

        return createResponse(data);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error discovering movies:", error.message);
            const status = error.message.includes("Missing") ? 400 : 500;
            return createErrorResponse(error.message, status);
        }
        return createErrorResponse("An unexpected error occurred", 500);
    }
}