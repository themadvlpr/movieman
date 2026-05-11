export const genresById: Record<number, string> = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
    // 10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
    // 10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics"
};


export interface MultiSearchResult {
    id: number;
    media_type: MediaType;
    title?: string;
    name?: string;
    poster_path?: string;
    profile_path?: string;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    known_for_department?: string;
}

export type MediaType = 'movie' | 'tv' | 'person';

export interface Video {
    id: string;
    iso_639_1: string;
    iso_3166_1: string;
    key: string;
    name: string;
    site: string;
    size: number;
    type: string;
}

/**
 * --- BASE MEDIA ---
 */
interface BaseMedia {
    id: number;
    backdrop_path: string;
    poster_path: string;
    overview: string;
    popularity: number;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    genres: { id: number; name: string }[];
    tagline?: string;
    origin_country?: string[];
    videos?: { results: Video[] };
}

/**
 * --- MOVIE ---
 */
export interface Movie extends BaseMedia {
    title: string;
    original_title: string;
    original_language: string;
    release_date: string;
    runtime: number;
    adult: boolean;
    video: boolean;
    logo_path?: string;
    production_countries?: { iso_3166_1: string; name: string }[];
}


