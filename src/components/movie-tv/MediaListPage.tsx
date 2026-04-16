import React, { memo } from 'react';
import { ChevronLeft, Grid, List } from 'lucide-react';
import GenreCard from '@/components/ui/GenreCard';

interface MediaPageLayoutProps {
    type: 'movies' | 'tvseries';
    categoryStyle: string;
    activeCategory: string;
    genreId?: string;
    isGenreSelected: boolean;
    isLoadingGenres: boolean;
    genres: any[];
    categories: { key: string; label?: string }[];
    viewMode: 'grid' | 'list';
    status: string;
    mediaData: any;
    userId: string;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    t: any;
    handleCategoryChange: (key: any) => void;
    handleGenreSelect: (id: number) => void;
    toggleView: (mode: 'grid' | 'list') => void;
    handleItemClick: (id: string) => void;
    fetchNextPage: () => void;
    ListComponent: React.ElementType; // MoviesPageList or TvSeriesPageList
}

const MediaPageLayout = ({
    type, categoryStyle, activeCategory, genreId, isGenreSelected,
    isLoadingGenres, genres, categories, viewMode, status,
    mediaData, userId, hasNextPage, isFetchingNextPage, t,
    handleCategoryChange, handleGenreSelect, toggleView,
    handleItemClick, fetchNextPage, ListComponent
}: MediaPageLayoutProps) => {
    return (
        <div className="pt-20 min-h-screen">
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-2">
                {/* Header */}
                <h1 className="text-3xl sm:text-5xl font-bold mb-5">
                    {genreId ? t('common', 'genre') : t('nav', type)}: {genreId ? t('genres', genreId) : t('categories', categoryStyle)}
                </h1>

                {isGenreSelected && (
                    <button
                        onClick={() => handleCategoryChange('genres')}
                        className="group mb-2 flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-lg transition-all duration-300 cursor-pointer active:scale-95"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors">
                            {t('common', 'backToGenres')}
                        </span>
                    </button>
                )}

                {/* Filters & Toggles */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-8">
                    <div className="flex flex-wrap items-center gap-1 w-full sm:w-fit bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1 overflow-x-auto no-scrollbar">
                        {categories.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => handleCategoryChange(key)}
                                className={`relative flex-1 sm:flex-none px-2 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap
                                    ${categoryStyle === key
                                        ? 'bg-white text-black shadow-lg shadow-white/10'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <span className="relative z-10">{label || t('categories', key)}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1">
                            <button onClick={() => toggleView('list')} className={`p-2 cursor-pointer rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-none'}`}>
                                <Grid className="w-4 h-4" />
                            </button>
                            <button onClick={() => toggleView('grid')} className={`p-2 cursor-pointer rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-none'}`}>
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {activeCategory !== categoryStyle && (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
                    </div>
                )}

                {/* Genre Grid */}
                {activeCategory === 'genres' && categoryStyle === 'genres' && !isGenreSelected && (
                    isLoadingGenres ? (
                        <div className="flex-1 flex min-h-[300px] flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 rounded-full border-3 border-white/10 border-t-white/30 animate-spin" />
                            <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">{t('common', 'loading')}</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-20">
                            {genres.map((genre, idx) => (
                                <GenreCard key={genre.id} genreId={genre.id} genreName={t('genres', genre.id)} genreBackDrop={genre.backdrop_path} idx={idx}
                                    onClick={() => handleGenreSelect(genre.id.toString())} />
                            ))}
                        </div>
                    )
                )}

                {/* Main Content List */}
                {(activeCategory !== 'genres' || isGenreSelected) && (activeCategory === categoryStyle) && (
                    <ListComponent
                        status={status}
                        {...(type === 'movies' ? { moviesData: mediaData } : { tvData: mediaData })}
                        viewMode={viewMode}
                        activeCategory={activeCategory}
                        userId={userId}
                        handleItemClick={handleItemClick}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                        t={t}
                    />
                )}
            </div>
        </div>
    );
};

export default memo(MediaPageLayout, (prev, next) => {
    return (
        prev.viewMode === next.viewMode &&
        prev.isLoadingGenres === next.isLoadingGenres &&
        prev.categoryStyle === next.categoryStyle &&
        prev.activeCategory === next.activeCategory &&
        prev.isGenreSelected === next.isGenreSelected &&
        prev.mediaData === next.mediaData &&
        prev.status === next.status
    );
});