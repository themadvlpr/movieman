'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Grid, List, Filter, ArrowUp, ArrowDown, Download, Loader2 } from "lucide-react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { updateViewMode } from "@/lib/tmdb/cookies-actions"
import { getLibraryAction } from "@/lib/actions/getLibraryAction"
import { exportAllUserMediaAction } from "@/lib/actions/exportAllUserMediaAction"
import Link from "next/link"
import * as XLSX from "xlsx"
import { toast } from "sonner"
import { useTranslation } from "@/providers/LocaleProvider"
import LibraryMediaCard from "@/components/library/LibraryMediaCard"
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig"

const libraries = [
    { key: 'watched' },
    { key: 'wishlist' },
    { key: 'favorite' },
]

const sortOptions = [
    { key: 'title', label: 'name' },
    { key: 'watchedDate', label: 'watchDate' },
    { key: 'year', label: 'releaseDate' },
    { key: 'userRating', label: 'userRating' },
    { key: 'rating', label: 'tmdbRating' },
]

// Survives client-side navigation
let _libraryScrollY = 0

interface Props {
    initialViewMode: 'grid' | 'list';
    userId: string;
}

type SortField = 'title' | 'watchedDate' | 'year' | 'userRating' | 'rating';
type SortOrder = 'asc' | 'desc';
type MediaType = 'all' | 'movie' | 'tv';
type CategoryType = 'watched' | 'wishlist' | 'favorite';

export default function LibraryPage({ initialViewMode, userId }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { t, locale } = useTranslation()

    const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
    const [isExporting, setIsExporting] = useState(false);

    const [activeCategory, setActiveCategory] = useState<CategoryType>(() => {
        const urlCategory = searchParams.get('category') as CategoryType;
        if (['watched', 'wishlist', 'favorite'].includes(urlCategory)) return urlCategory;
        return 'watched';
    });

    const [mediaType, setMediaType] = useState<MediaType>(() => {
        const urlType = searchParams.get('type') as MediaType;
        if (['all', 'movie', 'tv'].includes(urlType)) return urlType;
        return 'all';
    });

    const [sortBy, setSortBy] = useState<SortField>(() => {
        const urlSort = searchParams.get('sort') as SortField;
        if (['title', 'watchedDate', 'year', 'userRating', 'rating'].includes(urlSort)) return urlSort;
        return 'watchedDate'; // Default sort is usually newest watch date for Watched category
    });

    const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
        const urlOrder = searchParams.get('order') as SortOrder;
        if (['asc', 'desc'].includes(urlOrder)) return urlOrder;
        return 'desc';
    });

    const toggleView = async (mode: 'grid' | 'list') => {
        const newMode = mode === 'grid' ? 'grid' : 'list'
        setViewMode(newMode)
        await updateViewMode(newMode, 'library')
    }

    // Sync state with URL when state changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        let changed = false;
        if (params.get('category') !== activeCategory) { params.set('category', activeCategory); changed = true; }
        if (params.get('type') !== mediaType) { params.set('type', mediaType); changed = true; }
        if (params.get('sort') !== sortBy) { params.set('sort', sortBy); changed = true; }
        if (params.get('order') !== sortOrder) { params.set('order', sortOrder); changed = true; }

        if (changed) {
            router.replace(pathname + '?' + params.toString(), { scroll: false });
        }
    }, [activeCategory, mediaType, sortBy, sortOrder, pathname, router, searchParams]);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            toast.loading("Gathering all your media...");

            const result = await exportAllUserMediaAction(userId, TMDB_LANGUAGES[locale as Locale]);

            toast.dismiss();

            if (!result.success || !result.data) {
                toast.error("Failed to export library");
                return;
            }

            if (result.data.length === 0) {
                toast.info("Your library is empty");
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(result.data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "All Media");

            const fileName = `MyLibrary_AllMedia_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);

            toast.success("Library exported successfully!");
        } catch (error) {
            console.error("Export Error: ", error);
            toast.dismiss();
            toast.error("Failed to export library");
        } finally {
            setIsExporting(false);
        }
    };

    const loaderRef = useRef<HTMLDivElement>(null)

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['library-list', activeCategory, mediaType, sortBy, sortOrder, locale], 
        queryFn: async ({ pageParam = 1 }) => {
            const result = await getLibraryAction(
                userId,
                activeCategory,
                mediaType,
                sortBy as any,
                sortOrder as any,
                pageParam.toString(),
                TMDB_LANGUAGES[locale as Locale]
            );

            if (!result || !result.success) throw new Error(result?.error || "Error fetching library");

            return result.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage && lastPage.page < lastPage.total_pages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 30, // 30 seconds
        refetchOnMount: "always",
    });

    const libraryData = useMemo(() => {
        return data?.pages.flatMap((page) => page?.results || []) || [];
    }, [data]);

    const handleItemClick = useCallback(() => {
        _libraryScrollY = window.scrollY;
    }, []);

    useEffect(() => {
        if (status !== 'success') return
        if (_libraryScrollY <= 0) return

        const y = _libraryScrollY
        _libraryScrollY = 0

        setTimeout(() => {
            window.scrollTo({ top: y, behavior: 'instant' })
        }, 50)
    }, [status])

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const target = entries[0]
            if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage()
            }
        }, {
            threshold: 0.1,
            rootMargin: '200px'
        })

        if (loaderRef.current) {
            observer.observe(loaderRef.current)
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current)
            }
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])


    const currentCategoryDataCount = (type: 'tv' | 'movie') => {
        if (activeCategory === 'watched') {
            return type === 'tv' ? data?.pages[0]?.watchedTvCount : data?.pages[0]?.watchedMoviesCount;
        }
        if (activeCategory === 'wishlist') {
            return type === 'tv' ? data?.pages[0]?.wishlListTvCount : data?.pages[0]?.wishlListMoviesCount;
        }
        if (activeCategory === 'favorite') {
            return type === 'tv' ? data?.pages[0]?.favoriteTvCount : data?.pages[0]?.favoriteMoviesCount;
        }
    }

    return (
        <div className="pt-20 min-h-screen">
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-2">
                <h1 className="text-3xl sm:text-5xl font-bold mb-5 flex flex-wrap items-center gap-3 sm:gap-6">
                    <span>{t('nav', 'library')}</span>

                </h1>
                <div className="flex items-center gap-2 sm:gap-3 mb-5">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500">{t('common', 'movies')}</span>
                        <span className="text-sm sm:text-base font-bold text-zinc-300">{status === 'pending' ?
                            <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white/30 animate-spin" /> :
                            currentCategoryDataCount('movie') || '-'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500">{t('common', 'series')}</span>
                        <span className="text-sm sm:text-base font-bold text-zinc-300">{status === 'pending' ?
                            <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white/30 animate-spin" /> :
                            currentCategoryDataCount('tv') || '-'}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 md:gap-6 mb-8">
                    {/* Categories */}
                    <div className="flex items-center gap-1 w-full sm:w-fit bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1 overflow-x-auto no-scrollbar">
                        {libraries.map(({ key }) => (
                            <button
                                key={key}
                                onClick={() => setActiveCategory(key as CategoryType)}
                                className={`relative flex-1 sm:flex-none px-2 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap
                                    ${activeCategory === key
                                        ? 'bg-white text-black shadow-lg shadow-white/10'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <span className="relative z-10">{t('common', key)}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">

                        <div className="flex flex-wrap gap-2">
                            {/* Media Type Filter */}
                            <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1">
                                {['all', 'movie', 'tv'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setMediaType(type as MediaType)}
                                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer capitalize
                                        ${mediaType === type ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}
                                    >
                                        {t('common', type)}
                                    </button>
                                ))}
                            </div>

                            {/* Sort Options */}
                            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortField)}
                                    className="bg-transparent text-white text-xs font-semibold py-2 px-3 outline-none cursor-pointer appearance-none"
                                >
                                    {sortOptions.map((opt) => (
                                        <option key={opt.key} value={opt.key} className="bg-zinc-900 text-white">
                                            {t('common', opt.label)}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                                    aria-label="Toggle Sort Order"
                                >
                                    {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex w-full sm:w-fit justify-between gap-2">

                            {/* Export All Data Button */}
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Export all to Excel"
                                title="Export all to Excel"
                            >
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                <span className="text-xs font-semibold">{t('common', 'exportAll')}</span>
                            </button>
                            {/* View Toggles */}
                            <div className="flex w-fit items-center gap-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1">
                                <button
                                    onClick={() => toggleView('grid')}
                                    className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => toggleView('list')}
                                    className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>



                        </div>

                    </div>

                </div>

                {/* ─── LIBRARY CONTENT ─── */}
                {status === 'pending' ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
                    </div>
                ) : libraryData.length > 0 ? (
                    <div className="flex flex-col gap-10">
                        <div
                            key={`${activeCategory}-${mediaType}-${sortBy}-${sortOrder}-${viewMode}`}
                            className={viewMode === 'grid'
                                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
                                : "flex flex-col gap-3 sm:gap-4"}
                            style={{ animation: 'fadeInUp 0.4s ease-out' }}
                        >
                            {libraryData.map((item, idx) => (
                                <LibraryMediaCard
                                    key={`${item.id}-${idx}`}
                                    item={item}
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
                                    <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Loading...</span>
                                </div>
                            ) : libraryData.length > 0 ? (
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
                        <h3 className="text-white text-xl font-bold mb-2">Your {activeCategory} list is empty</h3>
                        <p className="text-zinc-500 text-sm max-w-xs mb-6">Start exploring movies and TV series to add them to your library.</p>
                        <Link href="/movies" className="px-6 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors">
                            Explore Movies
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}