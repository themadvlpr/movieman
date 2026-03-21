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
    origin_country?: string;
    runtime: number
    genres: { id: number; name: string }[]
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

export interface Cast {
    id: number
    name: string
    character: string
    profile_path: string | null
}

export interface Crew {
    id: number
    name: string
    job: string
}

export interface MovieDetailProps {
    movie: Movie
    credits: { cast: Cast[]; crew: Crew[] }
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
}

export interface TvSeriesDetailProps {
    series: TvSeries
    credits: { cast: Cast[]; crew: Crew[] }
    similarSeries: any[]
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

export interface PersonCredits {
    cast: {
        id: number;
        title?: string;
        name?: string;
        character: string;
        poster_path: string | null;
        release_date?: string;
        first_air_date?: string;
        vote_average: number;
        vote_count: number;
    }[];
    crew: {
        id: number;
        title?: string;
        name?: string;
        job: string;
        department: string;
        poster_path: string | null;
        release_date?: string;
        first_air_date?: string;
        vote_average: number;
        vote_count: number;
    }[];
}

export interface PersonDetailProps {
    person: Person;
    movieCredits: PersonCredits;
    tvCredits: PersonCredits;
}