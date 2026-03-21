import { tmdbFetch, CacheConfig, createResponse, createErrorResponse } from "@/lib/tmdb/tmdb-api";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query) {
            return createResponse({ results: [] });
        }

        const data = await tmdbFetch(
            "/search/multi",
            { query, include_adult: 'false' },
            CacheConfig.SEARCH
        );

        if (!data) {
            return createErrorResponse("Failed to fetch search results from TMDB", 500);
        }

        return createResponse(data);
    } catch (error: unknown) {
        console.error("Error in /api/search route:", error);
        return createErrorResponse(
            error instanceof Error ? error.message : "An unexpected error occurred",
            500
        );
    }
}