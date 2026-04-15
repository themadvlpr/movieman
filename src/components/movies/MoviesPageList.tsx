import { Movie } from "@/lib/tmdb/types/tmdb-types";
import MovieCard from "@/components/movies/MovieCard";
import { Filter } from "lucide-react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useEffect, useState, useLayoutEffect } from "react";

interface MoviesPageListProps {
    status: 'pending' | 'success' | 'error';
    moviesData: Movie[];
    viewMode: 'grid' | 'list';
    activeCategory: 'popular' | 'topRated' | 'upcoming' | 'genres';
    userId: string;
    handleItemClick: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    t: (category: string, key: string) => string;
    setActiveCategory: (category: 'popular' | 'topRated' | 'upcoming' | 'genres') => void;
}

export default function MoviesPageList({
    status,
    moviesData,
    viewMode,
    activeCategory,
    userId,
    handleItemClick,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    t,
    setActiveCategory
}: MoviesPageListProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    const [columnCount, setColumnCount] = useState(2);
    const [scrollMargin, setScrollMargin] = useState(0);
    const lastFetchedIndexRef = useRef(-1);

    // Sync column count
    useEffect(() => {
        const updateColumns = () => {
            if (typeof window === 'undefined') return;
            const width = window.innerWidth;
            if (width >= 1024) setColumnCount(6);
            else if (width >= 768) setColumnCount(4);
            else if (width >= 640) setColumnCount(3);
            else setColumnCount(2);
        };
        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    // Reset fetch guard when category or mode changes
    useLayoutEffect(() => {
        lastFetchedIndexRef.current = -1;
    }, [activeCategory, viewMode]);

    // Stabilized scrollMargin measurement
    useLayoutEffect(() => {
        const updateMargin = () => {
            if (parentRef.current) {
                const rect = parentRef.current.getBoundingClientRect();
                const absoluteTop = Math.floor(rect.top + window.scrollY);

                // Significant change or first measurement
                if (Math.abs(absoluteTop - scrollMargin) > 5 || (scrollMargin === 0 && absoluteTop > 0)) {
                    setScrollMargin(absoluteTop);
                }
            }
        };

        updateMargin();
        window.addEventListener('resize', updateMargin);
        const timers = [200, 1000, 3000].map(t => setTimeout(updateMargin, t));

        return () => {
            window.removeEventListener('resize', updateMargin);
            timers.forEach(clearTimeout);
        }
    }, [activeCategory, viewMode, columnCount, scrollMargin]);

    const effectiveColumns = viewMode === 'grid' ? columnCount : 1;

    // Group movies into rows
    const rows = useMemo(() => {
        const result = [];
        for (let i = 0; i < moviesData.length; i += effectiveColumns) {
            result.push(moviesData.slice(i, i + effectiveColumns));
        }
        return result;
    }, [moviesData, effectiveColumns]);

    const virtualizer = useWindowVirtualizer({
        count: rows.length,
        estimateSize: () => {
            if (viewMode === 'list') return 250;
            if (columnCount >= 6) return 460;
            if (columnCount >= 4) return 420;
            if (columnCount >= 3) return 380;
            return 360;
        },
        overscan: 10,
        scrollMargin,
        getItemKey: (index) => `${index}`, // Use simple index since count handles resetting
    });

    const virtualRows = virtualizer.getVirtualItems();

    // STRICT Infinite Scroll Trigger
    useEffect(() => {
        // Guard 1: Don't trigger if already loading, finished, or in error
        if (!hasNextPage || isFetchingNextPage || status !== 'success') return;

        // Guard 2: Virtual rows must exist
        if (virtualRows.length === 0) return;

        const lastItem = virtualRows[virtualRows.length - 1];
        if (!lastItem) return;

        // Guard 3: Only trigger if we are near the end 
        // AND we haven't already requested a fetch for this specific list length.
        // This stops the recursive loop even if the browser is "stuck" at the bottom.
        if (lastItem.index >= rows.length - 4 && rows.length > lastFetchedIndexRef.current) {
            lastFetchedIndexRef.current = rows.length;
            fetchNextPage();
        }
    }, [virtualRows, rows.length, hasNextPage, isFetchingNextPage, status, fetchNextPage]);

    if (status === 'pending' && moviesData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
            </div>
        );
    }

    if (moviesData.length === 0 && status !== 'pending') {
        return (
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
        );
    }

    return (
        <div
            ref={parentRef}
            className="relative w-full"
            style={{
                minHeight: '400px',
                overflowAnchor: 'none', // DISABLE BROWSER SCROLL ANCHORING
            }}
        >
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                    overflowAnchor: 'none', // DISABLE BROWSER SCROLL ANCHORING
                    pointerEvents: 'none',
                }}
            >
                {virtualRows.map((virtualRow) => {
                    const rowItems = rows[virtualRow.index];
                    if (!rowItems) return null;

                    return (
                        <div
                            key={virtualRow.key}
                            data-index={virtualRow.index}
                            ref={virtualizer.measureElement}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                                paddingBottom: viewMode === 'grid'
                                    ? (columnCount >= 4 ? '24px' : columnCount === 3 ? '16px' : '12px')
                                    : '16px',
                                pointerEvents: 'auto',
                            }}
                        >
                            <div className={viewMode === 'grid'
                                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
                                : "flex flex-col gap-3 sm:gap-4"}
                            >
                                {rowItems.map((movie, idx) => (
                                    <MovieCard
                                        key={`${movie.id}-${virtualRow.index * effectiveColumns + idx}`}
                                        movie={movie}
                                        idx={virtualRow.index * effectiveColumns + idx}
                                        viewMode={viewMode}
                                        activeCategory={activeCategory}
                                        userId={userId}
                                        onItemClick={handleItemClick}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Loader */}
            <div className="w-full flex justify-center py-20 relative z-10">
                {hasNextPage && isFetchingNextPage ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-3 border-white/10 border-t-white/30 animate-spin transition-all" />
                        <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">{t('common', 'loading')}</span>
                    </div>
                ) : !hasNextPage && moviesData.length > 0 ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-px w-20 bg-white/10" />
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">{t('common', 'endOfList')}</span>
                    </div>
                ) : null}
            </div>
        </div>
    );
}