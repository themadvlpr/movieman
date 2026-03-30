import { tmdbFetch, CacheConfig, createResponse, createErrorResponse } from "@/lib/tmdb/tmdb-api";

interface TMDBQueryParams {
    page: string;
    [key: string]: string | number | undefined;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category") || "popular";
        const page = searchParams.get("page") || "1";

        // Map internal category keys to TMDB endpoints
        let endpoint = '/movie/popular';
        let params: TMDBQueryParams = { page };
        if (category === 'popular') endpoint = '/movie/popular';
        else if (category === 'topRated') endpoint = '/movie/top_rated';
        else if (category === 'upcoming') {
            endpoint = '/discover/movie';
            const today = new Date().toISOString().split('T')[0];
            params = {
                page,
                'primary_release_date.gte': today,
                'sort_by': 'popularity.desc',
                'with_release_type': '2|3'
            };
        }

        const data = await tmdbFetch(
            endpoint,
            params,
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
