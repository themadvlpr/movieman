export interface dbState extends dbMediaStatus {
    title: string;
    id?: number;
    type?: string;
    mediaId?: number;
    userId?: string;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    poster?: string | null;
    rating?: number | null;
    userRating?: number | null;
    userComment?: string | null;
    year: Date | string;
    watchedDate?: Date | null;
}

export interface dbMediaStatus {
    isWatched?: boolean;
    isFavorite?: boolean;
    isWishlist?: boolean;
}
