/**
 * --- COMMON & UTILS ---
 */
export type MediaType = 'movie' | 'tv' | 'person';

export const genresById: Record<number, string> = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
    10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
    10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics"
};

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
 * --- BASE MEDIA (Общие поля для фильмов и сериалов) ---
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

/**
 * --- TV SERIES ---
 */
export interface TvSeries extends BaseMedia {
    name: string;
    first_air_date: string;
    last_air_date?: string;
    number_of_seasons: number;
    number_of_episodes: number;
    status: string;
    created_by?: {
        id: number;
        name: string;
        profile_path: string | null;
    }[];
}

/**
 * --- PEOPLE & CREDITS ---
 */
export interface Person {
    id: number;
    name: string;
    biography: string;
    birthday: string | null;
    deathday: string | null;
    gender: number;
    known_for_department: string;
    place_of_birth: string | null;
    profile_path: string | null;
    popularity: number;
}

export interface CrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
}

export interface Actor {
    id: number;
    name?: string;
    title?: string; // Для случаев, когда актер в списке фильма (Movie)
    character: string;
    profile_path: string | null;
    poster_path: string | null; // Для списка работ
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    vote_count: number;
    roles?: {
        character: string;
        episode_count?: number;
    }[];
}

export interface PersonCredits {
    cast: Actor[];
    crew: CrewMember[];
}

/**
 * --- PROPS & RESULTS ---
 */
export interface MovieDetailProps {
    movie: Movie;
    credits: { cast: Actor[]; crew: CrewMember[] };
    similarMovies: Movie[];
}

export interface TvSeriesDetailProps {
    series: TvSeries;
    credits: { cast: Actor[]; crew: CrewMember[] };
    similarSeries: TvSeries[];
}

export interface PersonDetailProps {
    person: Person;
    movieCredits: PersonCredits;
    tvCredits: PersonCredits;
}

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

export interface SearchResponse {
    results: MultiSearchResult[];
    total_results: number;
    total_pages: number;
    page: number;
}

/**
 * --- LIBRARY (Оптимизированный под Prisma) ---
 */
export interface LibraryResult {
    id: number;
    media_type: 'movie' | 'tv';
    // Эти поля приходят из API/кэша
    title: string;
    poster_path: string | null;
    vote_average: number;
    release_date: string;
    overview: string | null;
    // Эти поля приходят из твоей БД (UserMedia)
    user_rating: number | null;
    watched_date: string | null;
    initialDbState: {
        isWatched: boolean;
        isFavorite: boolean;
        isWishlist: boolean;
    };
}

// Вспомогательные типы для мерджа
export type RawCredit = Actor | CrewMember;
export type MergedCredit = RawCredit & {
    characters?: string[];
    jobs?: string[];
    character?: string;
    job?: string;
    poster_path?: string | null;
    vote_count?: number;
    release_date?: string;
    first_air_date?: string;
    title?: string;
    name?: string;
};