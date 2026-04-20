'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Play, Eye, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MoviePoster from '@/components/ui/MoviePoster';
import LibraryControlsButtons from '@/components/ui/LibraryControlsButtons';
import StarRating from '@/components/ui/StarRating';
import { useTranslation } from '@/providers/LocaleProvider';

interface MediaCardProps {
    item: any;
    idx: number;
    viewMode: 'grid' | 'list';
    userId: string;
    onItemClick: () => void;
    isLibrary?: boolean;
    sessionUserId?: string;
    isPublic?: boolean;
    publicName?: string;
    type?: 'movies' | 'tvseries';
    activeCategory?: string;
}

const MediaCard = ({
    item,
    idx,
    viewMode,
    userId,
    onItemClick,
    isLibrary = false,
    sessionUserId,
    isPublic,
    publicName,
    type,
    activeCategory
}: MediaCardProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const isGrid = viewMode === 'grid';


    // Media type and links
    const mediaType = type ? (type === 'movies' ? 'movie' : 'tv') : (item.media_type || (item.title ? 'movie' : 'tv'));
    const isTv = mediaType === 'tv';
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const href = isTv ? `/tvseries/${item.id}` : `/movies/${item.id}`;
    const genreBaseUrl = isTv ? '/tvseries' : '/movies';

    // Controls logic
    const showControls = !isLibrary || (!isPublic || !!sessionUserId);
    // Target user id for controls (if public library, then session user id, else user id)
    const targetUserId = isLibrary && isPublic ? sessionUserId : userId;
    const dbState = item.initialDbState || {};

    // Index badge
    const rankingBadge = (
        <div className={`absolute z-30 pointer-events-none bg-black/70 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white border border-white/20 
            ${isGrid ? 'top-2 left-2 px-2 py-1 rounded-lg' : 'top-1.5 left-1.5 w-6 h-6 rounded-md sm:rounded-lg'}`}>
            {idx + 1}
        </div>
    );

    // Media type badge
    const typeBadge = isGrid && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 rounded-md text-[9px] font-bold text-white border border-white/10 z-30 uppercase">
            {isTv ? t('common', 'tv') : t('common', 'movie')}
        </div>
    );


    return (
        <div
            onClick={() => {
                onItemClick();
                router.push(href);
            }}
            className={`relative group transition-all duration-300 ${isGrid
                ? "flex flex-col gap-2 sm:gap-3"
                : "flex flex-row gap-3 sm:p-4 p-3 rounded-xl cursor-pointer sm:rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/20"
                }`}>

            {/* POSTER SECTION */}
            <div className={isGrid
                ? "relative aspect-2/3 rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-500"
                : "relative w-25 sm:w-35 h-fit aspect-2/3 rounded-lg sm:rounded-xl overflow-hidden shrink-0"
            }>
                <Link href={href} onClick={onItemClick} className="relative z-10 block w-full h-full">
                    <MoviePoster
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt={title}
                        priority={idx < 12}
                        className={isGrid ? "group-hover:scale-110 transition-transform duration-700 ease-out" : "group-hover:scale-105 transition-transform duration-500"}
                    />

                    <div className={`absolute inset-0 ${isGrid ? 'bg-black/60' : 'bg-black/40'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20`}>
                        <div className={isGrid ? "w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/30" : ""}>
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                        </div>
                    </div>
                </Link>

                {rankingBadge}
                {typeBadge}

                {/* LIBRARY CONTROL BUTTONS IN GRID VIEW */}
                {isGrid && showControls && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 px-2 pointer-events-none hidden sm:block">
                        <div className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-auto">
                            <LibraryControlsButtons
                                mediaId={item.id}
                                mediaData={{
                                    titleEn: title,
                                    posterEn: item.poster_path,
                                    tmdbRating: item.vote_average,
                                    releaseDate: releaseDate,
                                    genreIds: item.genre_ids?.join(',')
                                }}
                                type={isTv ? 'tv' : 'movie'}
                                detailPage={false}
                                userId={targetUserId || ""}
                                initialState={dbState}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* INFORMATION SECTION */}
            <div className={isGrid ? "px-0.5" : "flex flex-col justify-center gap-2 sm:gap-3 min-w-0 flex-1"}>

                <div className="flex flex-col gap-0.5 min-w-0">
                    {!isGrid && (
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                            {isTv ? t('common', 'tv') : t('common', 'movie')}
                        </span>
                    )}
                    <Link href={href} onClick={onItemClick} className="block w-full">
                        <h2 className={`text-white font-bold hover:text-white/80 transition-colors truncate ${isGrid ? 'text-xs sm:text-sm' : 'text-sm sm:text-xl'}`}>
                            {title}
                        </h2>
                    </Link>
                </div>

                {/* GENRES AND DESCRIPTION (ONLY IN LIST VIEW) */}
                {!isGrid && item.genre_ids && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {item.genre_ids.slice(0, 3).map((genreId: number) => (
                            <span key={genreId}
                                className='cursor-pointer hover:text-white hover:bg-white/10 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[10px] sm:text-[11px] text-zinc-400 transition-colors'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onItemClick();
                                    router.push(`${genreBaseUrl}?category=genres&genreId=${genreId}`);
                                }}
                            >
                                {t('genres', genreId.toString())}
                            </span>
                        ))}
                    </div>
                )}

                {/* META DATA (DATE, RATINGS, WATCHED DATE) */}
                <div className={`flex flex-wrap gap-2 sm:gap-3 mt-1 ${isGrid ? 'flex-row items-center' : 'flex-col justify-start'}`}>

                    <span className="text-zinc-400 text-[10px] flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {isGrid || activeCategory !== 'upcoming' ? releaseDate?.slice(0, 4) : releaseDate?.split('-').reverse().join('.')}
                    </span>

                    {/* TMDB RATING */}
                    {item.vote_average > 0 && (
                        <StarRating text={`${isGrid ? '' : t('common', 'tmdbRating') + ':'} ${item.vote_average.toFixed(1)}`} ratingType="tmdb" />
                    )}


                    {/* USER RATING */}
                    {(!isLibrary || sessionUserId !== undefined) && item.initialDbState?.userRating > 0 && (
                        <StarRating
                            text={`${isGrid ? '' : t('common', 'myRating') + ':'} ${(item.initialDbState?.userRating || 0).toFixed(1)}`}
                            ratingType={"my"}
                        />
                    )}

                    {/* SHARED USER RATING */}
                    {item.user_rating > 0 && isPublic && (sessionUserId !== userId) && (
                        <StarRating
                            text={`${isPublic && publicName ? publicName + ':' : ''} ${(item.user_rating).toFixed(1)}`}
                            ratingType={"user"}
                        />
                    )}


                    {/* WATCHED DATE (ONLY IN LIST VIEW) */}
                    {!isGrid && item.watched_date && (
                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 w-fit">
                            <Eye className="w-2.5 h-2.5 text-zinc-400" />
                            <span className="text-zinc-300 text-[9px] sm:text-xs font-medium">
                                {item.watched_date.slice(0, 10).split('-').reverse().join('.')}
                            </span>
                        </div>
                    )}
                </div>

                {!isGrid && item.overview && (
                    <p className="hidden md:line-clamp-2 text-zinc-500 text-xs mt-2 max-w-2xl leading-relaxed">
                        {item.overview}
                    </p>
                )}

                {/* DISCOVER BUTTON IN LIST VIEW */}
                {!isGrid && (
                    <div className="hidden sm:flex items-center gap-4 mt-2 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                        <Link href={href} onClick={onItemClick} className="flex items-center gap-2 text-[#414141] text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:text-zinc-300 transition-colors">
                            <span>{t('common', 'discover')}</span>
                            <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                        </Link>
                    </div>
                )}
            </div>

            {/* LIBRARY CONTROL BUTTONS IN LIST VIEW */}
            {!isGrid && showControls && (
                <div className="hidden sm:flex items-center pr-4">
                    <div className="translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <LibraryControlsButtons
                            mediaId={item.id}
                            mediaData={{
                                titleEn: title,
                                posterEn: item.poster_path,
                                tmdbRating: item.vote_average,
                                releaseDate: releaseDate,
                                genreIds: item.genre_ids?.join(',')
                            }}
                            type={isTv ? 'tv' : 'movie'}
                            detailPage={false}
                            userId={targetUserId || ""}
                            initialState={dbState}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(MediaCard, (prev, next) => {
    return (
        prev.item.id === next.item.id &&
        prev.viewMode === next.viewMode &&
        prev.idx === next.idx &&
        prev.item.user_rating === next.item.user_rating &&
        prev.item.initialDbState?.userRating === next.item.initialDbState?.userRating &&
        prev.item.initialDbState?.isWatched === next.item.initialDbState?.isWatched &&
        prev.item.initialDbState?.isWishlist === next.item.initialDbState?.isWishlist &&
        prev.activeCategory === next.activeCategory
    );
});