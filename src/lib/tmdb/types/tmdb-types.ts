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
    similarMovies: any[]
}