import { tmdbFetch, CacheConfig, validateParams, createResponse, createErrorResponse } from "@/lib/tmdb-api";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category") || "popular";
        const page = searchParams.get("page") || "1";

        // Map internal category keys to TMDB endpoints
        const endpointMap: Record<string, string> = {
            popular: "/movie/popular",
            topRated: "/movie/top_rated",
            upcoming: "/movie/upcoming"
        };

        const endpoint = endpointMap[category] || "/movie/popular";

        const data = await tmdbFetch(
            endpoint,
            { page },
            CacheConfig.LISTS
        );

        if (!data) {
            return createErrorResponse("Failed to fetch movies from TMDB", 500);
        }

        // Return the formatted response
        return createResponse(data);
    } catch (error: unknown) {
        console.error("Error in /api/movies route:", error);
        return createErrorResponse(
            error instanceof Error ? error.message : "An unexpected error occurred",
            500
        );
    }
}
