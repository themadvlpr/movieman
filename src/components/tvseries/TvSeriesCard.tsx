import React, { memo } from 'react';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import MoviePoster from '@/components/ui/MoviePoster';
import LibraryControlsButtons from '@/components/ui/LibraryControlsButtons';
import { useTranslation } from '@/providers/LocaleProvider';
import { TvSeries } from '@/lib/tmdb/types/tmdb-types';
import { dbState } from '@/lib/tmdb/types/db-types';

interface TvSeriesCardProps {
    show: TvSeries & { initialDbState?: dbState };
    idx: number;
    viewMode: 'grid' | 'list';
    userId: string;
    onItemClick: () => void;
}

const TvSeriesCard = ({
    show,
    idx,
    viewMode,
    userId,
    onItemClick
}: TvSeriesCardProps) => {
    const { t } = useTranslation();
    const isGrid = viewMode === 'grid';

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
                    mediaId={show.id}
                    mediaData={{
                        titleEn: show.name,
                        posterEn: show.poster_path,
                        tmdbRating: show.vote_average,
                        releaseDate: show.first_air_date,
                        userDescription: show.overview,
                        genreIds: show.genre_ids?.join(',')
                    }}
                    type="tv"
                    detailPage={false}
                    userId={userId}
                    initialState={show.initialDbState || {}}
                />
            </div>
        </div>
    );

    return (
        <div className="relative group">
            <Link
                href={`/tvseries/${show.id}`}
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
                    : "relative w-[40%] sm:w-32 aspect-2/3 h-fit sm:h-auto rounded-lg sm:rounded-xl overflow-hidden shrink-0"
                }>
                    <MoviePoster
                        src={"https://image.tmdb.org/t/p/w500" + show.poster_path}
                        alt={show.name}
                        priority={idx < 4}
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
                <div className={isGrid ? "px-0.5 sm:px-1" : "flex flex-col justify-center gap-2 sm:gap-3 min-w-0 p-0 sm:pr-20"}>
                    <h3 className={`text-white font-bold truncate transition-colors ${isGrid ? 'text-xs sm:text-sm line-clamp-2' : 'text-xl sm:text-2xl text-wrap'
                        }`}>
                        {show.name}
                    </h3>
                    {isGrid &&
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                            {show.vote_average > 0 && (
                                <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-white/10">
                                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                    <span className="text-white text-[10px] font-bold">
                                        {show.vote_average.toFixed(1)}
                                    </span>
                                </div>
                            )}
                            {show.initialDbState?.userRating && show.initialDbState.userRating > 0 && (
                                <div className="flex w-fit items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/20 text-blue-400">
                                    <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-blue-400 text-blue-400" />
                                    <span className="text-white text-[10px] font-bold">
                                        {show.initialDbState.userRating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                            <span className="text-zinc-400 text-[10px]">{show.first_air_date?.slice(0, 4)}</span>
                        </div>
                    }

                    {!isGrid && (
                        <>
                            <span className="text-zinc-400 text-[10px] sm:text-sm">{show.first_air_date?.slice(0, 4)}</span>
                            <div className="flex flex-wrap gap-1">
                                {show.genre_ids?.slice(0, 3).map((genreId: number) => (
                                    <span key={genreId} className='px-1 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[8px] sm:text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md text-zinc-400'>
                                        {t('genres', genreId.toString())}
                                    </span>
                                ))}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-white/10">
                                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-500 text-yellow-500" />
                                    <span className="text-white text-[10px] sm:text-xs font-bold">
                                        {show.vote_average.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                            {show.initialDbState?.userRating && show.initialDbState.userRating > 0 && (
                                <div className="flex w-fit items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/20 text-blue-400">
                                    <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-blue-400 text-blue-400" />
                                    <span className="text-white text-[10px] font-bold">
                                        {show.initialDbState.userRating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                            <p className="hidden text-zinc-400 text-xs sm:text-sm line-clamp-1 sm:line-clamp-2 max-w-2xl">
                                {show.overview}
                            </p>
                            <div className="flex items-center gap-4 mt-2 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
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

export default memo(TvSeriesCard, (prevProps, nextProps) => {
    return (
        prevProps.show.id === nextProps.show.id &&
        prevProps.show.initialDbState?.isWatched === nextProps.show.initialDbState?.isWatched &&
        prevProps.show.initialDbState?.isFavorite === nextProps.show.initialDbState?.isFavorite &&
        prevProps.show.initialDbState?.isWishlist === nextProps.show.initialDbState?.isWishlist &&
        prevProps.viewMode === nextProps.viewMode &&
        prevProps.idx === nextProps.idx
    );
});
