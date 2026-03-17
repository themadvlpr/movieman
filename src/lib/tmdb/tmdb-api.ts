const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

interface TmdbOptions extends RequestInit {
    revalidate?: number | false;
    tags?: string[];
}

type TmdbParams = Record<string, string | number | boolean | undefined | null>;



export async function tmdbFetch(endpoint: string, params: TmdbParams = {}, options: TmdbOptions = {}) {
    if (!TMDB_API_KEY) {
        console.error("Critical Error: TMDB_API_KEY not found in .env");
        return null;
    }

    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append("language", "en-US");

    // Add parameters from arguments
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
        }
    });

    try {
        const response = await fetch(url.toString(), {
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${TMDB_API_KEY}`,
            },

            next: {
                revalidate: options.revalidate ?? 3600, // caches result for 1 hour or time you pass in options
                tags: options.tags || [], // tags help to reset cache, if you don't want to wait for revalidation (usage - revalidateTag('tag-name'));
            },
        });

        if (!response.ok) {
            throw new Error(`TMDB Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
}


// Cache config for different endpoints
export const CacheConfig = {
    DETAILS: { revalidate: 3600 },
    LISTS: { revalidate: 900 },
    SEARCH: { revalidate: 300 },
    STATIC: { revalidate: 86400 },
};


// Validate parameters for API requests
export function validateParams(params: TmdbParams, required: string[] = []) {
    const missing = required.filter((key) => !params[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required parameters: ${missing.join(", ")}`);
    }
}

type CacheOptions = {
    maxage?: number;       // How long to cache (in seconds)
    stale?: number;        // How long to serve stale data while new data is being fetched
}

export function createResponse(data: any, status = 200, options: CacheOptions = {}
) {
    const { maxage = 3600, stale = 86400 } = options;

    return Response.json(data, {
        status,
        headers: {
            "Cache-Control": `public, s-maxage=${maxage}, stale-while-revalidate=${stale}`,
            "Content-Type": "application/json",
        },
    });
}

export function createErrorResponse(message: string, status = 500) {
    return Response.json(
        {
            error: message,
            timestamp: new Date().toISOString(),
        },
        { status }
    );
}