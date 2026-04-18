import MediaCard from "@/components/movie-tv/MediaCard";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useEffect, useState, useLayoutEffect } from "react";

interface LibraryPageListProps {
    status: 'pending' | 'success' | 'error' | string;
    libraryData: any[];
    viewMode: 'grid' | 'list';
    activeCategory: string;
    userId: string;
    sessionUserId?: string;
    isPublic?: boolean;
    publicName: string;
    handleItemClick: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    t: (category: string, key: string) => string;
}

export default function LibraryPageList({
    status,
    libraryData,
    viewMode,
    activeCategory,
    userId,
    sessionUserId,
    isPublic,
    publicName,
    handleItemClick,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    t,
}: LibraryPageListProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    const [columnCount, setColumnCount] = useState(2);
    const [scrollMargin, setScrollMargin] = useState(0);
    const lastFetchedIndexRef = useRef(-1);

    // Sync column count based on window width
    // useEffect(() => {
    //     const updateColumns = () => {
    //         if (typeof window === 'undefined') return;
    //         const width = window.innerWidth;
    //         if (width >= 1024) setColumnCount(6);
    //         else if (width >= 768) setColumnCount(4);
    //         else if (width >= 640) setColumnCount(3);
    //         else setColumnCount(2);
    //     };
    //     updateColumns();
    //     window.addEventListener('resize', updateColumns);
    //     return () => window.removeEventListener('resize', updateColumns);
    // }, []);

    useLayoutEffect(() => {
        const updateColumns = () => {
            if (typeof window === 'undefined') return;
            const width = window.innerWidth;

            setColumnCount(prev => {
                let next;
                if (width >= 1024) next = 6;
                else if (width >= 768) next = 4;
                else if (width >= 640) next = 3;
                else next = 2;
                return prev === next ? prev : next;
            });
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    // Reset infinite fetch guard when category or view mode changes
    useLayoutEffect(() => {
        lastFetchedIndexRef.current = -1;
    }, [activeCategory, viewMode]);

    // Stabilized scrollMargin measurement for virtualization
    useLayoutEffect(() => {
        const updateMargin = () => {
            if (parentRef.current) {
                const rect = parentRef.current.getBoundingClientRect();
                const absoluteTop = Math.floor(rect.top + window.scrollY);

                // Significant change or initial non-zero measurement
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

    // Batch items into rows for virtualization
    const rows = useMemo(() => {
        const result = [];
        for (let i = 0; i < libraryData.length; i += effectiveColumns) {
            result.push(libraryData.slice(i, i + effectiveColumns));
        }
        return result;
    }, [libraryData, effectiveColumns]);

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

    // Infinite Scroll Trigger — fires only when user actually scrolled near the bottom
    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage || status !== 'success') return;
        if (virtualRows.length === 0 || rows.length === 0) return;

        const lastItem = virtualRows[virtualRows.length - 1];
        if (!lastItem) return;

        // Guard: don't re-fetch for the same rows.length
        if (rows.length === lastFetchedIndexRef.current) return;

        // Only trigger if the user has actually scrolled near the bottom of the page.
        // Without this check, the trigger fires immediately on first mount because
        // lastFetchedIndexRef starts at -1 and all visible rows satisfy the index threshold.
        const scrolledNearBottom =
            window.scrollY + window.innerHeight >= document.body.scrollHeight - 600;

        if (lastItem.index >= rows.length - 3 && scrolledNearBottom) {
            lastFetchedIndexRef.current = rows.length;
            fetchNextPage();
        }
    }, [virtualRows, rows.length, hasNextPage, isFetchingNextPage, status, fetchNextPage]);

    if (status === 'pending' && libraryData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
            </div>
        );
    }

    // This section is handled in LibraryPage.tsx for "no results" state, 
    // but we can have a fallback here if needed.
    if (libraryData.length === 0 && status !== 'pending') {
        return null;
    }

    return (
        <div
            ref={parentRef}
            className="relative w-full mt-10"
            style={{
                minHeight: '400px',
                overflowAnchor: 'none', // Critical for preventing scroll loops
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
                                    ? (columnCount >= 4 ? '12px' : columnCount === 3 ? '16px' : '12px')
                                    : '16px',
                                pointerEvents: 'auto',
                            }}
                        >
                            <div className={viewMode === 'grid'
                                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
                                : "flex flex-col gap-3 sm:gap-4"}
                            >
                                {rowItems.map((item, idx) => {
                                    const globalIndex = virtualRow.index * effectiveColumns + idx;
                                    return (
                                        <MediaCard
                                            key={`${item.id}-${globalIndex}`}
                                            item={item}
                                            idx={globalIndex}
                                            isLibrary={true}
                                            viewMode={viewMode}
                                            userId={userId}
                                            sessionUserId={sessionUserId}
                                            isPublic={isPublic}
                                            publicName={publicName}
                                            onItemClick={handleItemClick}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Loader (Synched with virtualization container) */}
            <div className="w-full flex justify-center py-20 relative z-10">
                {hasNextPage && isFetchingNextPage ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-3 border-white/10 border-t-white/30 animate-spin" />
                        <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">{t('common', 'loading')}</span>
                    </div>
                ) : !hasNextPage && libraryData.length > 0 ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-px w-20 bg-white/10" />
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">{t('common', 'endOfList')}</span>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
