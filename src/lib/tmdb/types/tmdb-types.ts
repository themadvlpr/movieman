export interface Movie {
    id: number;
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    tagline?: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
    logo_path?: string;
    production_countries?: { iso_3166_1: string; name: string }[];
    runtime: number
    genres: { id: number; name: string }[]
    origin_country?: string[];
    videos?: { results: Video[] };
}

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


export const genresById = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
};


export interface CrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
}

export interface MainTvCrewItem {
    id: number;
    name: string;
    jobs: string[];
}

export interface MovieDetailProps {
    movie: Movie
    credits: { cast: Actor[]; crew: CrewMember[] }
    similarMovies: Movie[]
}

export interface TvSeries {
    id: number;
    backdrop_path: string;
    first_air_date: string;
    last_air_date?: string;
    created_by?: {
        id: number;
        name: string;
        profile_path: string | null;
    }[];
    genres: { id: number; name: string }[];
    name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    vote_average: number;
    vote_count: number;
    tagline?: string;
    number_of_seasons: number;
    number_of_episodes: number;
    status: string;
    origin_country?: string[];
    videos?: { results: Video[] };
}

export interface TvSeriesDetailProps {
    series: TvSeries
    credits: { cast: Actor[]; crew: CrewMember[] }
    similarSeries: TvSeries[]
}

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

export interface Actor {
    id: number;
    title?: string;
    name?: string;
    character: string;
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    vote_count: number;
    profile_path: string | null;
    roles?: {
        character: string;
        episode_count?: number;
    }[];
}

export interface PersonCredits {
    cast: Actor[];
    crew: CrewMember[];
}

export interface PersonDetailProps {
    person: Person;
    movieCredits: PersonCredits;
    tvCredits: PersonCredits;
}

export type CreditMedia = (Movie | TvSeries) & {
    id?: number;
    character?: string;
    job?: string;
};

export interface MultiSearchResult {
    id: number;
    media_type: 'movie' | 'tv' | 'person';
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