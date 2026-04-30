'use client';

import React, { useRef, useState, useMemo, useCallback, useEffect, useLayoutEffect } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Filter } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

interface MediaVirtualListProps<T> {
    items: T[];
    activeCategory: string;
    viewMode: 'grid' | 'list';
    status: 'pending' | 'success' | 'error';
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    className?: string;
    restoreScrollOffset?: number;
    restoreScrollIndex?: number;
    onScrollRestored?: () => void;
    renderCard: (item: T, index: number) => React.ReactNode;
    t: any;
}

export default function MediaVirtualList<T extends { id: string | number }>({
    items,
    activeCategory,
    viewMode,
    status,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    className = "",
    restoreScrollOffset = 0,
    restoreScrollIndex = -1,
    onScrollRestored,
    renderCard,
    t
}: MediaVirtualListProps<T>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const parentRef = useRef<HTMLDivElement>(null);
    const [columnCount, setColumnCount] = useState(2);
    const [scrollMargin, setScrollMargin] = useState(0);
    const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
    const restorationFiredRef = useRef(false);
    const lastFetchedIndexRef = useRef(-1);

    // 1. Adaptive Columns
    useLayoutEffect(() => {
        const updateColumns = () => {
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

    // 2. Stable Scroll Margin
    useLayoutEffect(() => {
        const updateMargin = () => {
            if (parentRef.current) {
                const rect = parentRef.current.getBoundingClientRect();
                const absoluteTop = Math.floor(rect.top + window.scrollY);
                if (absoluteTop > 0 && Math.abs(absoluteTop - scrollMargin) > 5) {
                    setScrollMargin(absoluteTop);
                }
            }
        };
        updateMargin();
        const timers = [50, 200, 500, 1500].map(ms => setTimeout(updateMargin, ms));
        return () => timers.forEach(clearTimeout);
    }, [activeCategory, viewMode, scrollMargin, columnCount]);

    // 3. Data Processing
    const effectiveColumns = viewMode === 'grid' ? columnCount : 1;
    const rows = useMemo(() => {
        const result = [];
        for (let i = 0; i < items.length; i += effectiveColumns) {
            result.push(items.slice(i, i + effectiveColumns));
        }
        return result;
    }, [items, effectiveColumns]);

    const estimateSize = useCallback(() => {
        if (measuredHeight) return measuredHeight;
        return viewMode === 'list' ? 280 : 380;
    }, [measuredHeight, viewMode]);

    const paddedRowCount = useMemo(() => {
        if (restoreScrollIndex < 0 || restorationFiredRef.current) return rows.length;
        const targetRowIndex = Math.floor(restoreScrollIndex / effectiveColumns);
        return Math.max(rows.length, targetRowIndex + 8);
    }, [rows.length, restoreScrollIndex, effectiveColumns, restorationFiredRef.current]);

    const virtualizer = useWindowVirtualizer({
        count: paddedRowCount,
        estimateSize,
        overscan: 12,
        scrollMargin,
        getItemKey: (index) => `${activeCategory}-${viewMode}-${index}`,
    });

    const virtualRows = virtualizer.getVirtualItems();

    // 5. Restoration Mechanism
    useEffect(() => {
        if (restoreScrollIndex < 0 || restorationFiredRef.current || status !== 'success' || items.length === 0) return;

        const targetRowIndex = Math.floor(restoreScrollIndex / effectiveColumns);

        if (rows.length <= targetRowIndex && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
            return;
        }

        // Perform the jump
        virtualizer.scrollToIndex(targetRowIndex, { align: 'start' });

        // Use double RAF to ensure we scroll AFTER the virtualizer 
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                window.scrollBy(0, -100);
            });
        });

        if (rows.length > targetRowIndex) {
            restorationFiredRef.current = true;
            onScrollRestored?.();
        }
    }, [restoreScrollIndex, items.length, rows.length, status, hasNextPage, isFetchingNextPage, fetchNextPage, onScrollRestored, virtualizer, effectiveColumns]);

    const measureFirstRow = useCallback((el: HTMLDivElement | null) => {
        if (!el) return;
        virtualizer.measureElement(el);
        const height = el.getBoundingClientRect().height;
        if (height > 50 && Math.abs((measuredHeight || 0) - height) > 2) {
            setMeasuredHeight(height);
        }
    }, [virtualizer, measuredHeight]);

    // 6. Infinite Scroll
    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage || status !== 'success' || rows.length === 0) return;
        const lastItem = virtualRows[virtualRows.length - 1];
        if (!lastItem || rows.length === lastFetchedIndexRef.current) return;

        const scrolledNearBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 1500;
        if (lastItem.index >= rows.length - 3 && scrolledNearBottom) {
            lastFetchedIndexRef.current = rows.length;
            fetchNextPage();
        }
    }, [virtualRows, rows.length, hasNextPage, isFetchingNextPage, status, fetchNextPage]);

    useEffect(() => {
        restorationFiredRef.current = false;
        lastFetchedIndexRef.current = -1;
    }, [activeCategory, viewMode]);

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
        <div
            ref={parentRef}
            className={`relative w-full mt-15 ${className}`}
            style={{ minHeight: '400px', overflowAnchor: 'none' }}
        >
            <div style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
            }}>
                {virtualRows.map((virtualRow) => {
                    const rowItems = rows[virtualRow.index];
                    if (!rowItems) return null;

                    return (
                        <div
                            key={virtualRow.key}
                            data-index={virtualRow.index}
                            ref={virtualRow.index === 0 ? measureFirstRow : virtualizer.measureElement}
                            className="absolute top-0 left-0 w-full"
                            style={{
                                transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                                paddingBottom: viewMode === 'grid' ? '24px' : '16px'
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

            {hasNextPage && (
                <div className="w-full flex justify-center py-20">
                    {(isFetchingNextPage || activeCategory === 'genres') && (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 rounded-full border-3 border-white/10 border-t-white/30 animate-spin" />
                            <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">{t('common', 'loading')}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
