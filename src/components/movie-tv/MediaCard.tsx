'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Play, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MoviePoster from '@/components/ui/MoviePoster';
import LibraryControlsButtons from '@/components/ui/LibraryControlsButtons';
import StarRating from '@/components/ui/StarRating';
import { useTranslation } from '@/providers/LocaleProvider';
import { LibraryResult, Movie, TvSeries } from '@/lib/tmdb/types/tmdb-types';

interface MediaCardProps {
    item: LibraryResult & Movie & TvSeries;
    type: 'movies' | 'tvseries';
    idx: number;
    viewMode: 'grid' | 'list';
    userId: string;
    onItemClick: () => void;
    activeCategory?: 'popular' | 'topRated' | 'upcoming' | 'genres';
}

const MediaCard = ({
    item,
    type,
    idx,
    viewMode,
    userId,
    onItemClick,
    activeCategory
}: MediaCardProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const isGrid = viewMode === 'grid';

    const title = type === 'movies' ? item.title : item.name;
    const releaseDate = type === 'movies' ? item.release_date : item.first_air_date;
    const href = type === 'movies' ? `/movies/${item.id}` : `/tvseries/${item.id}`;
    const genreBaseUrl = type === 'movies' ? '/movies' : '/tvseries';

    const rankingBadge = (
        <div className={`absolute ${isGrid ? 'top-2 left-2 w-6 h-6 rounded-lg' : 'top-1.5 left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg'} bg-black/70 backdrop-blur-md flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white border border-white/20 z-30 pointer-events-none`}>
            {idx + 1}
        </div>
    );

    const controls = (
        <div className={isGrid
            ? "absolute top-0 inset-0 pointer-events-none z-20 flex flex-col items-center justify-end"
            : "absolute bottom-6 right-6 z-30 pointer-events-none translate-x-4 group-hover:translate-x-0 transition-all duration-300"
        }>
            <div className={`hidden sm:block pointer-events-auto ${isGrid ? 'mb-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300' : ''}`}>
                <LibraryControlsButtons
                    mediaId={item.id}
                    mediaData={{
                        titleEn: title,
                        posterEn: item.poster_path,
                        tmdbRating: item.vote_average,
                        releaseDate: releaseDate,
                        genreIds: item.genre_ids?.join(',')
                    }}
                    type={type === 'movies' ? 'movie' : 'tv'}
                    detailPage={false}
                    userId={userId}
                    initialState={item.initialDbState || {}}
                />
            </div>
        </div>
    );

    return (
        <div className="relative group">
            <Link
                href={href}
                prefetch={false}
                onClick={onItemClick}
                className={isGrid
                    ? "flex flex-col gap-2 sm:gap-3 cursor-pointer"
                    : "flex flex-row gap-3 sm:gap-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/20 transition-all duration-300"
                }
            >
                {/* Poster Section */}
                <div className={isGrid
                    ? "relative aspect-2/3 rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-500"
                    : "relative w-25 sm:w-35 h-fit aspect-2/3 rounded-lg sm:rounded-xl overflow-hidden shrink-0"
                }>
                    <MoviePoster
                        src={"https://image.tmdb.org/t/p/w500" + item.poster_path}
                        alt={title}
                        priority={idx < 8}
                        className={isGrid ? "group-hover:scale-110 transition-transform duration-700 ease-out" : "group-hover:scale-105 transition-transform duration-500"}
                    />
                    {!isGrid && rankingBadge}
                    <div className={`absolute inset-0 ${isGrid ? 'bg-black/60' : 'bg-black/40'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20`}>
                        <div className={isGrid ? "w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 scale-90 group-hover:scale-100 transition-transform duration-300" : ""}>
                            <Play className={`${isGrid ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} fill-white ml-0.5`} />
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className={isGrid ? "px-0.5 sm:px-1" : "flex flex-col justify-center gap-2 sm:gap-3 min-w-0 pr-0 sm:pr-20"}>
                    <h3 className={`text-white font-bold truncate transition-colors ${isGrid ? 'text-xs sm:text-sm' : 'text-sm sm:text-xl'}`}>
                        {title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                        <span className="text-zinc-400 text-[10px] flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {activeCategory === 'upcoming' ? releaseDate?.split('-').reverse().join('.') : releaseDate?.slice(0, 4)}
                        </span>
                        {item.vote_average > 0 && <StarRating text={item.vote_average.toFixed(1)} ratingType="tmdb" />}
                        {item.initialDbState?.userRating && item.initialDbState?.userRating > 0 && <StarRating text={item.initialDbState.userRating.toFixed(1)} ratingType="my" />}
                    </div>

                    {!isGrid && (
                        <>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {item.genre_ids?.slice(0, 3).map((genreId: number) => (
                                    <span key={genreId} className='hover:text-white hover:bg-white/10 px-1 py-0.5 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-zinc-400'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onItemClick();
                                            router.push(`${genreBaseUrl}?category=genres&genreId=${genreId}`);
                                            window.scrollTo({ top: 0, behavior: 'instant' });
                                        }}
                                    >
                                        {t('genres', genreId.toString())}
                                    </span>
                                ))}
                            </div>
                            <p className="hidden sm:line-clamp-2 text-zinc-400 text-xs sm:text-sm mt-2 max-w-2xl">
                                {item.overview}
                            </p>
                        </>
                    )}
                </div>
            </Link>
            {controls}
            {isGrid && rankingBadge}
        </div>
    );
};

export default memo(MediaCard, (prev, next) => {
    return (
        prev.item.id === next.item.id &&
        prev.viewMode === next.viewMode &&
        prev.idx === next.idx &&
        prev.item.initialDbState?.userRating === next.item.initialDbState?.userRating &&
        prev.item.initialDbState?.isWishlist === next.item.initialDbState?.isWishlist &&
        prev.item.initialDbState?.isWatched === next.item.initialDbState?.isWatched &&
        prev.item.title === next.item.title &&
        prev.item.poster_path === next.item.poster_path &&
        prev.item.initialDbState?.isWishlist === next.item.initialDbState?.isWishlist &&
        prev.item.initialDbState?.isWatched === next.item.initialDbState?.isWatched &&
        prev.item.initialDbState?.isFavorite === next.item.initialDbState?.isFavorite &&
        prev.item.initialDbState?.userRating === next.item.initialDbState?.userRating &&
        JSON.stringify(prev.item.initialDbState?.listIds) === JSON.stringify(next.item.initialDbState?.listIds) &&
        prev.viewMode === next.viewMode &&
        prev.activeCategory === next.activeCategory &&
        prev.idx === next.idx &&
        prev.item.initialDbState?.userRating === next.item.initialDbState?.userRating
    );
});