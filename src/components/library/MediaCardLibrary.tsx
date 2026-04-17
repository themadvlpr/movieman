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
    isLibrary: boolean;
    sessionUserId?: string;
    isPublic?: boolean;
    publicName?: string;
    type?: 'movies' | 'tvseries';
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
    type
}: MediaCardProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const isGrid = viewMode === 'grid';

    const mediaType = type ? (type === 'movies' ? 'movie' : 'tv') : (item.media_type || (item.title ? 'movie' : 'tv'));
    const isTv = mediaType === 'tv';
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const href = isTv ? `/tvseries/${item.id}` : `/movies/${item.id}`;
    const genreBaseUrl = isTv ? '/tvseries' : '/movies';

    const showControls = !isLibrary || (!isPublic || !!sessionUserId);
    const targetUserId = isLibrary && isPublic ? sessionUserId : userId;
    const dbState = isLibrary ? item.initialDbState : (item.initialDbState || {});


    const rankingBadge = (
        <div className={`absolute ${isGrid ? 'top-2 left-2 w-6 h-6 rounded-lg' : 'top-1.5 left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg'} 
        bg-black/70 backdrop-blur-md flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white border border-white/20 z-30 pointer-events-none`}>
            {idx + 1}
        </div>
    );

    return (
        <div className={`relative group transition-all duration-300 ${isGrid
            ? "flex flex-col gap-2 sm:gap-3"
            : "flex flex-row gap-3 sm:gap-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/20"
            }`}>

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
                        <div className={isGrid ? "w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30" : ""}>
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                        </div>
                    </div>
                </Link>

                {isGrid && rankingBadge}


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

            <div className={isGrid ? "px-0.5" : "flex flex-col justify-center gap-2 sm:gap-3 min-w-0 flex-1"}>
                {!isGrid && rankingBadge}

                <div className="flex flex-col gap-0.5">
                    {!isGrid && (
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                            {isTv ? t('common', 'tv') : t('common', 'movie')}
                        </span>
                    )}
                    {!isGrid &&
                        <Link href={href} onClick={onItemClick}>
                            <h2 className={`text-white font-bold hover:text-white/80 w-fit transition-colors truncate ${isGrid ? 'text-xs sm:text-sm' : 'text-sm sm:text-xl'}`}>
                                {title}
                            </h2>
                        </Link>}
                </div>

                {item.genre_ids && !isGrid && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {item.genre_ids.slice(0, 3).map((genreId: number) => (
                            <span key={genreId}
                                className='cursor-pointer hover:text-white hover:bg-white/10 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-[11px] text-zinc-400 transition-colors'
                                onClick={() => {
                                    onItemClick();
                                    router.push(`${genreBaseUrl}?category=genres&genreId=${genreId}`);
                                }}
                            >
                                {t('genres', genreId.toString())}
                            </span>
                        ))}
                    </div>
                )}

                <div className={`flex flex-wrap gap-2 sm:gap-3 mt-1 ${isGrid ? 'flex-row' : 'flex-col justify-start'}`}>
                    {!isGrid &&
                        <span className="text-zinc-400 text-[10px] sm:text-sm flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {releaseDate?.split('-').reverse().join('.')}
                        </span>
                    }
                    {item.vote_average > 0 && <StarRating text={`${isGrid ? '' : t('common', 'tmdbRating') + ':'} ${item.vote_average.toFixed(1)}`} ratingType="tmdb" />}

                    {isPublic && item.viewer_rating != null && item.viewer_rating > 0 && (
                        <StarRating text={`${isGrid ? '' : t('common', 'myRating') + ':'} ${item.viewer_rating.toFixed(1)}`} ratingType="my" />
                    )}
                    {item.user_rating != null && item.user_rating > 0 && (
                        <StarRating text={`${isPublic ? publicName : isGrid ? '' : t('common', 'myRating') + ':'} ${item.user_rating.toFixed(1)}`} ratingType={isPublic ? "user" : "my"} />
                    )}

                    {!isGrid && item.watched_date && (
                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 w-fit">
                            <Eye className="w-2.5 h-2.5 text-zinc-400" />
                            <span className="text-zinc-300 text-[9px] sm:text-xs font-medium">{item.watched_date.slice(0, 10).split('-').reverse().join('.')}</span>
                        </div>
                    )}
                </div>

                {!isGrid && (

                    <div className="hidden sm:flex items-center gap-4 mt-2 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                        <Link href={href} onClick={onItemClick} className="flex items-center gap-2 text-[#414141] text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:text-zinc-300 transition-colors">
                            <span>{t('common', 'discover')}</span>
                            <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                        </Link>
                    </div>

                )}
            </div>

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
        JSON.stringify(prev.item.initialDbState) === JSON.stringify(next.item.initialDbState)
    );
});