export interface dbState extends dbMediaStatus {
    id?: number;
    type?: string;
    mediaId?: number;
    userId?: string;

    tmdbRating?: number | null;
    releaseDate?: Date | string | null;

    userDescription?: string | null;
    createdAt?: Date;
    updatedAt?: Date;

    userRating?: number | null;
    userComment?: string | null;
    watchedDate?: Date | null;

    titleEn?: string | null;
    titleRu?: string | null;
    titleUk?: string | null;

    posterEn?: string | null;
    posterRu?: string | null;
    posterUk?: string | null;

    genreIds?: string | null;
}

export interface dbMediaStatus {
    userRating?: number | null;
    isWatched?: boolean;
    isFavorite?: boolean;
    isWishlist?: boolean;
}
