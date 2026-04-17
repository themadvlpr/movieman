'use client'

import { Filter } from "lucide-react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useEffect, useState, useLayoutEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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
    onScrollRestored
}: MediaVirtualListProps<T>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const parentRef = useRef<HTMLDivElement>(null);
    const [columnCount, setColumnCount] = useState(2);
    const [scrollMargin, setScrollMargin] = useState(0);
    const lastFetchedIndexRef = useRef(-1);

    // 1. Logic: Column Count
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

    useLayoutEffect(() => {
        lastFetchedIndexRef.current = -1;
    }, [activeCategory, viewMode]);

    // 2. Logic: Scroll Margin
    const scrollMarginRef = useRef(0);
    useLayoutEffect(() => {
        const updateMargin = () => {
            if (parentRef.current) {
                const rect = parentRef.current.getBoundingClientRect();
                const absoluteTop = Math.round(rect.top + window.scrollY);
                // Only update if change is significant — avoid infinite loop by using ref instead of state in deps
                if (Math.abs(absoluteTop - scrollMarginRef.current) > 2) {
                    scrollMarginRef.current = absoluteTop;
                    setScrollMargin(absoluteTop);
                }
            }
        };

        updateMargin();
        window.addEventListener('resize', updateMargin);

        // One delayed measurement to catch font/layout shifts after initial render
        const timer = setTimeout(updateMargin, 300);
        return () => {
            window.removeEventListener('resize', updateMargin);
            clearTimeout(timer);
        }
        // scrollMargin intentionally NOT in deps — would cause infinite loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCategory, viewMode, columnCount]);

    // 2.1 Logic: Coordinated Scroll Restoration
    const restorationFiredRef = useRef(false);
    useLayoutEffect(() => {
        // Reset restoration flag when key navigation parameters change
        restorationFiredRef.current = false;
    }, [activeCategory, viewMode]);



    const effectiveColumns = viewMode === 'grid' ? columnCount : 1;

    // 3. Logic: Rows Grouping
    const rows = useMemo(() => {
        const result = [];
        for (let i = 0; i < items.length; i += effectiveColumns) {
            result.push(items.slice(i, i + effectiveColumns));
        }
        return result;
    }, [items, effectiveColumns]);

    const virtualizer = useWindowVirtualizer({
        count: rows.length,
        estimateSize: () => {
            if (viewMode === 'list') return 250;
            if (columnCount >= 6) return 460;
            if (columnCount >= 4) return 420;
            if (columnCount >= 3) return 370; // Refined from 380
            return 325; // Refined from 360 for mobile grid
        },
        overscan: 20, // Increased for smoother high-refresh-rate mobile scrolling
        scrollMargin,
        getItemKey: (index) => `${index}`,
    });

    useEffect(() => {
        if (restoreScrollOffset <= 0 || restorationFiredRef.current || status !== 'success' || items.length === 0) return;
        if (scrollMargin === 0) return;

        restorationFiredRef.current = true;

        // If browser's auto scrollRestoration already brought us close — just clean up, don't fight it
        if (Math.abs(window.scrollY - restoreScrollOffset) < 100) {
            onScrollRestored?.();
            return;
        }

        // Otherwise manually scroll (browser didn't auto-restore, e.g. first load or iOS quirk)
        onScrollRestored?.();
        window.scrollTo({ top: restoreScrollOffset, behavior: 'instant' });
    }, [restoreScrollOffset, status, items.length, scrollMargin, onScrollRestored]);

    const virtualRows = virtualizer.getVirtualItems();

    // 4. Logic: Infinite Scroll
    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage || status !== 'success') return;
        if (virtualRows.length === 0) return;
        const lastItem = virtualRows[virtualRows.length - 1];
        if (lastItem && lastItem.index >= rows.length - 4 && rows.length > lastFetchedIndexRef.current) {
            lastFetchedIndexRef.current = rows.length;
            fetchNextPage();
        }
    }, [virtualRows, rows.length, hasNextPage, isFetchingNextPage, status, fetchNextPage]);

    // Empty States
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
                    className="mt-6 text-white text-sm font-semibold underline underline-offset-4 hover:text-zinc-300 cursor-pointer"
                >
                    {t('common', 'resetFilters')}
                </button>
            </div>
        );
    }

    return (
        <div ref={parentRef} className="relative w-full" style={{ minHeight: '400px', overflowAnchor: 'none' }}>
            <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative', overflowAnchor: 'none', pointerEvents: 'none' }}>
                {virtualRows.map((virtualRow) => {
                    const rowItems = rows[virtualRow.index];
                    if (!rowItems) return null;

                    return (
                        <div
                            key={virtualRow.key}
                            data-index={virtualRow.index}
                            style={{
                                position: 'absolute', top: 0, left: 0, width: '100%',
                                transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                                paddingBottom: viewMode === 'grid' ? (columnCount >= 4 ? '24px' : '12px') : '16px',
                                pointerEvents: 'auto',
                            }}
                        >
                            <div className={viewMode === 'grid'
                                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
                                : "flex flex-col gap-3 sm:gap-4"}>
                                {rowItems.map((item, idx) => renderCard(item, virtualRow.index * effectiveColumns + idx))}
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