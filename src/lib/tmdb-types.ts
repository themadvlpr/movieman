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
