export interface dbState extends dbMediaStatus {
    // Deprecated fields, keeping optional to prevent widespread build errors if they are still accessed
    title?: string;
    poster?: string | null;
    rating?: number | null;
    
    // New schema fields
    tmdbRating?: number | null;
    releaseYear?: number | null;
    
    id?: number;
    type?: string;
    mediaId?: number;
    userId?: string;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    userRating?: number | null;
    userComment?: string | null;
    year?: Date | string | null;
    watchedDate?: Date | null;
}

export interface dbMediaStatus {
    userRating?: number | null;
    isWatched?: boolean;
    isFavorite?: boolean;
    isWishlist?: boolean;
}
