'use client'

import { Filter } from "lucide-react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useEffect, useState, useLayoutEffect, useCallback } from "react";
import { usePathname, useSearchParams  } from 'next/navigation';
import { useLocalizedRouter as useRouter } from '@/components/navigation/useRouter';;

interface MediaVirtualListProps<T> {
    status: string;
    items: T[];
    viewMode: 'grid' | 'list';
    activeCategory: string;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    t: (category: string, key: string) => string;
    renderCard: (item: T, index: number) => React.ReactNode;
    restoreScrollOffset?: number;
    onScrollRestored?: () => void;
    className?: string;
}

export default function MediaVirtualList<T extends { id: number | string }>({
    status,
    items,
    viewMode,
    activeCategory,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    t,
    renderCard,
    restoreScrollOffset = 0,
    onScrollRestored,
    className = ""
}: MediaVirtualListProps<T>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const parentRef = useRef<HTMLDivElement>(null);
    const [columnCount, setColumnCount] = useState(2);
    const [scrollMargin, setScrollMargin] = useState(0);
    const lastFetchedIndexRef = useRef(-1);
    const restorationFiredRef = useRef(false);

    // Adaptive grid (Columns Count)
    useLayoutEffect(() => {
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

    // Stabilization of the margin measurement (Scroll Margin)
    // Important for the correct operation of useWindowVirtualizer when the header is present
    useLayoutEffect(() => {
        const updateMargin = () => {
            if (parentRef.current) {
                const rect = parentRef.current.getBoundingClientRect();
                const absoluteTop = Math.floor(rect.top + window.scrollY);

                if (Math.abs(absoluteTop - scrollMargin) > 5 || (scrollMargin === 0 && absoluteTop > 0)) {
                    setScrollMargin(absoluteTop);
                }
            }
        };

        updateMargin();
        window.addEventListener('resize', updateMargin);
        // Several checks to compensate for dynamic content above the list
        const timers = [100, 500, 1500].map(ms => setTimeout(updateMargin, ms));

        return () => {
            window.removeEventListener('resize', updateMargin);
            timers.forEach(clearTimeout);
        };
    }, [activeCategory, viewMode, columnCount, scrollMargin]);

    // Grouping elements into rows
    const effectiveColumns = viewMode === 'grid' ? columnCount : 1;
    const rows = useMemo(() => {
        const result = [];
        for (let i = 0; i < items.length; i += effectiveColumns) {
            result.push(items.slice(i, i + effectiveColumns));
        }
        return result;
    }, [items, effectiveColumns]);

    // Initialization of the virtualizer
    const virtualizer = useWindowVirtualizer({
        count: rows.length,
        estimateSize: useCallback(() => {
            if (viewMode === 'list') return 280;
            if (columnCount >= 6) return 460;
            if (columnCount >= 4) return 420;
            if (columnCount >= 3) return 380;
            return 360;
        }, [viewMode, columnCount]),
        overscan: 12,
        scrollMargin,
        getItemKey: (index) => `${activeCategory}-${index}`,
    });

    const virtualRows = virtualizer.getVirtualItems();

    // Logic for restoring scroll
    useEffect(() => {
        if (restoreScrollOffset <= 0 || restorationFiredRef.current || status !== 'success' || items.length === 0) return;
        if (scrollMargin === 0) return;

        // Start restoration process
        const startTime = Date.now();
        const timeout = 2000; // 2 seconds max for restoration

        const timer = setInterval(() => {
            const currentScroll = window.scrollY;
            const targetScroll = restoreScrollOffset;
            const currentHeight = document.body.scrollHeight;
            const viewportHeight = window.innerHeight;

            // 1. Check if we reached the target
            if (Math.abs(currentScroll - targetScroll) < 10) {
                restorationFiredRef.current = true;
                clearInterval(timer);
                onScrollRestored?.();
                return;
            }

            // 2. Check if we timed out
            if (Date.now() - startTime > timeout) {
                restorationFiredRef.current = true;
                clearInterval(timer);
                onScrollRestored?.();
                return;
            }

            // 3. If height is insufficient, try to fetch more and scroll to bottom in the meantime
            if (currentHeight < targetScroll + (viewportHeight / 2)) {
                if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
                window.scrollTo({ top: targetScroll, behavior: 'instant' });
            } else {
                // 4. Height is sufficient, scroll to target
                window.scrollTo({ top: targetScroll, behavior: 'instant' });
            }
        }, 60);

        return () => clearInterval(timer);

    }, [restoreScrollOffset, status, items.length, scrollMargin, onScrollRestored, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // 6. Infinite Scroll 
    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage || status !== 'success') return;
        if (virtualRows.length === 0 || rows.length === 0) return;

        const lastItem = virtualRows[virtualRows.length - 1];
        if (!lastItem || rows.length === lastFetchedIndexRef.current) return;

        // Check: are we really at the bottom of the page
        const scrolledNearBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 800;

        if (lastItem.index >= rows.length - 3 && scrolledNearBottom) {
            lastFetchedIndexRef.current = rows.length;
            fetchNextPage();
        }
    }, [virtualRows, rows.length, hasNextPage, isFetchingNextPage, status, fetchNextPage]);

    // Reset flags when changing category/mode
    useLayoutEffect(() => {
        lastFetchedIndexRef.current = -1;
        restorationFiredRef.current = false;
        virtualizer.measure();
    }, [activeCategory, viewMode, virtualizer]);

    // Loading and empty states
    if (status === 'pending' && items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
            </div>
        );
    }

    if (items.length === 0 && status !== 'pending') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <Filter className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">{t('common', 'noResults')}</h3>
                <button
                    onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete('category');
                        params.delete('genreId');
                        router.push(pathname + '?' + params.toString(), { scroll: false });
                    }}
                    className="mt-6 text-white text-sm font-semibold underline underline-offset-4 hover:text-zinc-300"
                >
                    {t('common', 'resetFilters')}
                </button>
            </div>
        );
    }

    return (
        <div ref={parentRef} className={`relative w-full mt-15 ${className}`} style={{ minHeight: '400px', overflowAnchor: 'none' }}>
            <div style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
                overflowAnchor: 'none',
                pointerEvents: 'none'
            }}>
                {virtualRows.map((virtualRow) => {
                    const rowItems = rows[virtualRow.index];
                    if (!rowItems) return null;

                    return (
                        <div
                            key={virtualRow.key}
                            ref={virtualizer.measureElement}
                            data-index={virtualRow.index}
                            style={{
                                position: 'absolute', top: 0, left: 0, width: '100%',
                                transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                                paddingBottom: viewMode === 'grid' ? '24px' : '16px',
                                pointerEvents: 'auto',
                            }}
                        >
                            <div className={viewMode === 'grid'
                                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
                                : "flex flex-col gap-3 sm:gap-4"}>
                                {rowItems.map((item, idx) =>
                                    renderCard(item, virtualRow.index * effectiveColumns + idx)
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Loading indicator */}
            <div className="w-full flex justify-center py-20 relative z-10">
                {hasNextPage && isFetchingNextPage ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-3 border-white/10 border-t-white/30 animate-spin" />
                        <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">{t('common', 'loading')}</span>
                    </div>
                ) : !hasNextPage && items.length > 0 ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-px w-20 bg-white/10" />
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">{t('common', 'endOfList')}</span>
                    </div>
                ) : null}
            </div>
        </div>
    );
}