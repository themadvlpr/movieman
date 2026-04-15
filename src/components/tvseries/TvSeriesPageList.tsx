import TvSeriesCard from "@/components/tvseries/TvSeriesCard";
import { Filter } from "lucide-react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useEffect, useState, useLayoutEffect } from "react";
import { TvSeries } from "@/lib/tmdb/types/tmdb-types";

interface TvSeriesPageListProps {
    status: 'pending' | 'success' | 'error' | string;
    tvData: TvSeries[];
    viewMode: 'grid' | 'list';
    activeCategory: 'popular' | 'topRated' | 'genres';
    userId: string;
    handleItemClick: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    t: (category: string, key: string) => string;
    setActiveCategory: (category: 'popular' | 'topRated' | 'genres') => void;
}

export default function TvSeriesPageList({
    status,
    tvData,
    viewMode,
    activeCategory,
    userId,
    handleItemClick,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    t,
    setActiveCategory
}: TvSeriesPageListProps) {
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

    // Group items into rows
    const rows = useMemo(() => {
        const result = [];
        for (let i = 0; i < tvData.length; i += effectiveColumns) {
            result.push(tvData.slice(i, i + effectiveColumns));
        }
        return result;
    }, [tvData, effectiveColumns]);

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
        getItemKey: (index) => `${index}`,
    });

    const virtualRows = virtualizer.getVirtualItems();

    // STRICT Infinite Scroll Trigger
    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage || status !== 'success') return;
        if (virtualRows.length === 0) return;

        const lastItem = virtualRows[virtualRows.length - 1];
        if (!lastItem) return;

        if (lastItem.index >= rows.length - 4 && rows.length > lastFetchedIndexRef.current) {
            lastFetchedIndexRef.current = rows.length;
            fetchNextPage();
        }
    }, [virtualRows, rows.length, hasNextPage, isFetchingNextPage, status, fetchNextPage]);

    if (status === 'pending' && tvData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
            </div>
        );
    }

    if (tvData.length === 0 && status !== 'pending') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <Filter className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">{t('common', 'noResults')}</h3>
                <p className="text-zinc-500 text-sm max-w-xs">{t('common', 'tryAdjustingFilters')}</p>
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
                overflowAnchor: 'none',
            }}
        >
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                    overflowAnchor: 'none',
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
                                {rowItems.map((show, idx) => (
                                    <TvSeriesCard
                                        key={`${show.id}-${virtualRow.index * effectiveColumns + idx}`}
                                        show={show}
                                        idx={virtualRow.index * effectiveColumns + idx}
                                        viewMode={viewMode}
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
                        <div className="w-8 h-8 rounded-full border-3 border-white/10 border-t-white/30 animate-spin" />
                        <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">{t('common', 'loading')}</span>
                    </div>
                ) : !hasNextPage && tvData.length > 0 ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-px w-20 bg-white/10" />
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">{t('common', 'endOfList')}</span>
                    </div>
                ) : null}
            </div>
        </div>
    );
}