import { Movie } from "@/lib/tmdb/types/tmdb-types";
import MovieCard from "@/components/movies/MovieCard";
import { Filter } from "lucide-react";

interface MoviesPageListProps {
    status: 'pending' | 'success' | 'error';
    moviesData: Movie[];
    viewMode: 'grid' | 'list';
    activeCategory: 'popular' | 'topRated' | 'upcoming' | 'genres';
    userId: string;
    handleItemClick: () => void;
    loaderRef: React.RefObject<HTMLDivElement | null>;
    hasNextPage: boolean;
    t: (category: string, key: string) => string;
    setActiveCategory: (category: 'popular' | 'topRated' | 'upcoming' | 'genres') => void;
}

export default function MoviesPageList({ status, moviesData, viewMode, activeCategory, userId, handleItemClick, loaderRef, hasNextPage, t, setActiveCategory }: MoviesPageListProps) {
    return (
        <>
            {/* ─── MOVIE CONTENT ─── */}
            {status === 'pending' ? (
                <div className="flex flex-col items-center justify-center py-40">
                    <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
                </div>
            ) : moviesData.length > 0 ? (
                <div className="flex flex-col gap-10">
                    <div
                        key={`${activeCategory}-${viewMode}`}
                        className={viewMode === 'grid'
                            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
                            : "flex flex-col gap-3 sm:gap-4"}
                        style={{ animation: 'fadeInUp 0.4s ease-out' }}
                    >
                        {moviesData.map((movie: Movie, idx: number) => (
                            <MovieCard
                                key={`${movie.id}-${idx}`}
                                movie={movie}
                                idx={idx}
                                viewMode={viewMode}
                                activeCategory={activeCategory}
                                userId={userId}
                                onItemClick={handleItemClick}
                            />
                        ))}
                    </div>


                    {/* Infinite Scroll Sentinel */}
                    <div ref={loaderRef} className="flex justify-center py-10">
                        {hasNextPage ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 rounded-full border-3 border-white/10 border-t-white/30 animate-spin" />
                                <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">{t('common', 'loading')}</span>
                            </div>
                        ) : moviesData.length > 0 ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-px w-20 bg-white/10" />
                                <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">{t('common', 'endOfList')}</span>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                        <Filter className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-white text-xl font-bold mb-2">{t('common', 'noResults')}</h3>
                    <p className="text-zinc-500 text-sm max-w-xs">{t('common', 'tryAdjustingYourFilters').slice(0, -5)}</p>
                    <button
                        onClick={() => { setActiveCategory('popular') }}
                        className="mt-6 text-white text-sm font-semibold underline underline-offset-4 hover:text-zinc-300 cursor-pointer"
                    >
                        {t('common', 'resetFilters')}
                    </button>
                </div>
            )}
        </>
    )
}