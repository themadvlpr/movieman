import { memo } from 'react';
import Link from 'next/link';
import { Play, Star, Calendar } from 'lucide-react';
import MoviePoster from '@/components/ui/MoviePoster';
import LibraryControlsButtons from '@/components/ui/LibraryControlsButtons';
import { useTranslation } from '@/providers/LocaleProvider';
import { useRouter } from 'next/navigation';

interface LibraryMediaCardProps {
    item: any;
    idx: number;
    viewMode: 'grid' | 'list';
    activeCategory: 'watched' | 'wishlist' | 'favorite' | string;
    userId: string;
    sessionUserId?: string;
    isPublic?: boolean;
    publicName: string;
    onItemClick: () => void;
}

const LibraryMediaCard = ({
    item,
    idx,
    viewMode,
    activeCategory,
    userId,
    sessionUserId,
    isPublic,
    publicName,
    onItemClick
}: LibraryMediaCardProps) => {
    const { t } = useTranslation();
    const isGrid = viewMode === 'grid';

    const router = useRouter();

    const rankingBadge = (
        <div className={`absolute ${isGrid ? 'top-2 left-2 w-6 h-6 rounded-lg' : 'top-1.5 left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg'} 
        bg-zinc-900/90 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white border border-white/20 z-30 pointer-events-none`}>
            {idx + 1}
        </div>
    );

    const showControls = !isPublic || !!sessionUserId;
    const targetUserId = isPublic ? sessionUserId : userId;

    const controls = showControls ? (
        <div className={isGrid
            ? "absolute top-0 inset-0 pointer-events-none z-20 flex flex-col items-center justify-end"
            : "absolute bottom-6 right-6 z-30 pointer-events-none translate-x-4 group-hover:translate-x-0 transition-all duration-300"
        }>
            <div className={`hidden sm:block pointer-events-auto ${isGrid ? 'mb-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300' : ''}`}>
                <LibraryControlsButtons
                    mediaId={item.id}
                    mediaData={{
                        titleEn: item.title,
                        posterEn: item.poster_path,
                        tmdbRating: item.vote_average,
                        releaseDate: item.release_date,
                    }}
                    type={item.media_type as 'movie' | 'tv'}
                    detailPage={false}
                    userId={targetUserId || ""}
                    initialState={item.initialDbState}
                />
            </div>
        </div>
    ) : null;

    const href = item.media_type === 'tv' ? `/tvseries/${item.id}` : `/movies/${item.id}`;

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
                {/* Poster Container */}
                <div className={isGrid
                    ? "relative aspect-2/3 rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-500"
                    : "relative w-25 sm:w-35 h-fit aspect-2/3 rounded-lg sm:rounded-xl overflow-hidden shrink-0"
                }>
                    <MoviePoster
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt={item.title}
                        priority={idx < 12}
                        className={isGrid ? "group-hover:scale-110 transition-transform duration-700 ease-out" : "group-hover:scale-105 transition-transform duration-500"}
                    />

                    {/* Media Type Badge on Grid View */}
                    {isGrid && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[9px] font-bold tracking-wider z-30 uppercase pointer-events-none border border-white/10">
                            {item.media_type === 'tv' ? t('common', 'tv') : t('common', 'movie')}
                        </div>
                    )}

                    {!isGrid && rankingBadge}

                    <div className={`absolute inset-0 ${isGrid ? 'bg-black/60' : 'bg-black/40'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20`}>
                        <div className={isGrid ? "w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 scale-90 group-hover:scale-100 transition-transform duration-300" : ""}>
                            <Play className={`${isGrid ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} fill-white ml-0.5`} />
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className={isGrid ? "px-0.5 sm:px-1" : "flex flex-col justify-center gap-2 sm:gap-3 min-w-0 pr-0 sm:pr-20"}>
                    <div className="flex flex-col gap-0.5">
                        {!isGrid && (
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                                {item.media_type === 'tv' ? t('common', 'tv') : t('common', 'movie')}
                            </span>
                        )}
                        <h3 className={`text-white font-bold transition-colors truncate ${isGrid ? 'text-xs sm:text-sm' : 'text-sm sm:text-xl'}`}>
                            {item.title}
                        </h3>
                    </div>

                    {/* Meta Info Grid */}
                    {isGrid &&
                        <div className="flex flex-col gap-1.5 mt-1.5">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                {item.vote_average > 0 && (
                                    <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-white/10">
                                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                        <span className="text-white text-[10px] font-bold">
                                            {item.vote_average.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                                <span className="text-zinc-400 text-[10px] flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5 text-zinc-400" />
                                    {item.release_date?.slice(0, 4)}
                                </span>
                                {item.user_rating != null && item.user_rating > 0 && (
                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${isPublic && item.viewer_rating != null ? 'bg-white/5 text-zinc-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        <Star className={`w-3 h-3 ${isPublic && item.viewer_rating != null ? 'fill-zinc-400 text-zinc-400' : 'fill-blue-400 text-blue-400'}`} />
                                        <span className="text-[10px] font-bold">
                                            {item.user_rating.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                                {isPublic && item.viewer_rating != null && item.viewer_rating > 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/20 text-blue-400">
                                        <Star className="w-3 h-3 fill-blue-400 text-blue-400" />
                                        <span className="text-[10px] font-bold">
                                            {item.viewer_rating.toFixed(1)}
                                        </span>
                                    </div>
                                )}

                            </div>
                            {(activeCategory === 'watched' || activeCategory === 'favorite') && item.watched_date && (
                                <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 w-fit">
                                    <Calendar className="w-2.5 h-2.5 text-zinc-400" />
                                    <span className="text-zinc-300 text-[9px] font-medium">{item.watched_date.slice(0, 10)}</span>
                                </div>
                            )}
                        </div>
                    }

                    {/* Meta Info List */}
                    {!isGrid && (
                        <>
                            <div className="flex flex-col items-start gap-2 sm:gap-3 mt-1">
                                <div className="flex flex-col gap-2 sm:gap-3">
                                    <span className="text-zinc-400 text-xs sm:text-sm flex gap-1 items-center">
                                        <Calendar className="w-2.5 h-2.5 text-zinc-400" />
                                        {item.release_date?.split('-').reverse().join('.')}
                                    </span>

                                    {item.genre_ids && item.genre_ids.length > 0 && (
                                        <>
                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                {item.genre_ids.slice(0, 3).map((genreId: number) => (
                                                    <span key={genreId} className='hover:text-white hover:bg-white/10 px-1 py-0.5 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm  backdrop-blur-md text-zinc-400'
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            onItemClick();
                                                            router.push(`/${item.media_type === 'tv' ? 'tvseries' : 'movies'}?category=genres&genreId=${genreId}`);
                                                        }}
                                                    >
                                                        {t('genres', genreId.toString())}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3">
                                    {item.vote_average > 0 && (
                                        <div className="flex w-fit items-center gap-1.5 px-2 py-1 rounded-md bg-white/10">
                                            <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-yellow-500 text-yellow-500" />
                                            <span className="text-white text-xs sm:text-sm font-bold">
                                                TMDB: {item.vote_average.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                    {item.user_rating != null && item.user_rating > 0 && (
                                        <div className="flex w-fit items-center gap-1.5 px-2 py-1 rounded-md bg-white/10">
                                            <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-blue-400/50 text-blue-400/50" />
                                            <span className="text-white text-xs sm:text-sm font-bold">
                                                {isPublic ? publicName : t('common', 'myRating')}: {item.user_rating.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                    {isPublic && item.viewer_rating != null && item.viewer_rating > 0 && (
                                        <div className="flex w-fit items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/20 text-blue-400">
                                            <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-blue-400 text-blue-400" />
                                            <span className="text-xs sm:text-sm font-bold">
                                                {t('common', 'myRating')}: {item.viewer_rating.toFixed(1)}
                                            </span>
                                        </div>
                                    )}

                                    {item.watched_date && (
                                        <div className="flex items-center gap-1.5 text-zinc-400">
                                            <span className="text-xs sm:text-sm font-medium">{t('common', 'watched')}: {item.watched_date.slice(0, 10).split('-').reverse().join('.')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="hidden sm:flex items-center gap-4 mt-2 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                <div className="flex items-center gap-2 text-[#414141] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                                    Discover
                                    <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#292929]" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Link>

            {controls}
            {isGrid && rankingBadge}
        </div>
    );
};

export default memo(LibraryMediaCard, (prevProps, nextProps) => {
    // Only re-render if essential props change
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.title === nextProps.item.title &&
        prevProps.item.poster_path === nextProps.item.poster_path &&
        prevProps.item.user_rating === nextProps.item.user_rating &&
        prevProps.item.viewer_rating === nextProps.item.viewer_rating &&
        prevProps.item.watched_date === nextProps.item.watched_date &&
        prevProps.item.initialDbState?.isWatched === nextProps.item.initialDbState?.isWatched &&
        prevProps.item.initialDbState?.isFavorite === nextProps.item.initialDbState?.isFavorite &&
        prevProps.item.initialDbState?.isWishlist === nextProps.item.initialDbState?.isWishlist &&
        prevProps.viewMode === nextProps.viewMode &&
        prevProps.activeCategory === nextProps.activeCategory &&
        prevProps.sessionUserId === nextProps.sessionUserId &&
        prevProps.idx === nextProps.idx
    );
});
