'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Grid, List, Filter, ArrowUp, ArrowDown, Download, Loader2, X } from "lucide-react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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

    const [showFilters, setShowFilters] = useState(false);

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

    const [selectedGenre, setSelectedGenre] = useState<string>(() => searchParams.get('genre') || 'all');
    const [selectedYear, setSelectedYear] = useState<string>(() => searchParams.get('year') || 'all');

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
        if (params.get('genre') !== selectedGenre) { params.set('genre', selectedGenre); changed = true; }
        if (params.get('year') !== selectedYear) { params.set('year', selectedYear); changed = true; }

        if (changed) {
            router.replace(pathname + '?' + params.toString(), { scroll: false });
        }
    }, [activeCategory, mediaType, sortBy, sortOrder, selectedGenre, selectedYear, pathname, router, searchParams]);

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
        queryKey: ['library-list', activeCategory, mediaType, sortBy, sortOrder, locale, selectedGenre, selectedYear],
        queryFn: async ({ pageParam = 1 }) => {
            const result = await getLibraryAction(
                userId,
                activeCategory,
                mediaType,
                sortBy as any,
                sortOrder as any,
                pageParam.toString(),
                TMDB_LANGUAGES[locale as Locale],
                selectedGenre !== 'all' ? parseInt(selectedGenre) : null,
                selectedYear !== 'all' ? selectedYear : null
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

    const genreIds = [
        28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402,
        9648, 10749, 878, 10770, 53, 10752, 37, 10759, 10762,
        10763, 10764, 10765, 10766, 10767, 10768
    ];

    const genres = useMemo(() => {
        return genreIds.map((id) => ({
            id: id.toString(),
            name: t('genres', `${id}`)
        }));
    }, [t]);

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const yearsList = [];
        for (let y = currentYear; y >= 1900; y--) {
            yearsList.push(y.toString());
        }
        return yearsList;
    }, []);

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
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 md:gap-6 mb-5">
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


                        </div>

                        <div className="flex  sm:w-fit justify-between items-center gap-2">
                            {/* View Toggles */}
                            <div className="flex w-fit items-center gap-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-1">
                                <button
                                    onClick={() => toggleView('grid')}
                                    className={`p-2 rounded-md transition-all duration-300 cursor-pointer ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => toggleView('list')}
                                    className={`p-2 rounded-md transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                    </div>

                </div>

                <div className="flex gap-2">
                    <div className={`group flex items-center border transition-all duration-300 rounded-md overflow-hidden ${showFilters
                        ? 'bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                        : 'bg-white/5 backdrop-blur-md border-white/10'
                        }`}>
                        {/* Основная часть кнопки */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-3 py-2 transition-colors cursor-pointer ${showFilters ? 'text-black' : 'text-white hover:bg-white/10'
                                }`}
                        >
                            <Filter
                                className={`w-4 h-4 transition-colors ${showFilters
                                    ? 'text-black animate-pulse'
                                    : (selectedGenre !== 'all' || selectedYear !== 'all')
                                        ? 'fill-white'
                                        : 'text-white'
                                    }`}
                            />
                            <span className="text-xs font-semibold">
                                {showFilters ? t('common', 'hideFilters') : t('common', 'showFilters')}
                            </span>
                        </button>

                        {/* Кнопка сброса (появляется только если фильтры применены) */}
                        {(selectedGenre !== 'all' || selectedYear !== 'all') && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Чтобы не сработало открытие фильтров
                                    setSelectedGenre('all');
                                    setSelectedYear('all');
                                }}
                                className={`flex items-center justify-center px-2 self-stretch border-l transition-colors cursor-pointer ${showFilters
                                    ? 'border-black/10 text-black hover:bg-black/5'
                                    : 'border-white/10 text-white hover:bg-white/10'
                                    }`}
                                title={t('common', 'resetFilters')}
                            >
                                <X className="w-3.5 h-3.5 stroke-[3px]" />
                            </button>
                        )}
                    </div>
                </div>
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, scale: 0.98 }}
                            animate={{ height: "auto", opacity: 1, scale: 1 }}
                            exit={{ height: 0, opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-col mt-5 md:flex-row flex-wrap items-stretch md:items-center gap-3 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-md">
                                {/* Genre Filter */}
                                <div className="flex flex-col gap-1.5 w-fit">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">{t('common', 'genre')}</span>
                                    <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                                        <SelectTrigger className="w-full md:w-fit cursor-pointer min-w-[130px] bg-white/5 border-white/10 rounded-md text-xs font-semibold text-white hover:bg-white/10 transition-all focus:ring-0 focus:ring-offset-0">
                                            <SelectValue placeholder={t('common', 'genre')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white rounded-md shadow-2xl p-1">
                                            <SelectItem value="all" className="text-xs focus:bg-white/10 focus:text-white cursor-pointer">
                                                {t('common', 'genre')}
                                            </SelectItem>
                                            {genres.map((g) => (
                                                <SelectItem
                                                    key={g.id}
                                                    value={g.id.toString()}
                                                    className="text-xs focus:bg-white/10 focus:text-white cursor-pointer"
                                                >
                                                    {g.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Year Filter */}
                                <div className="flex flex-col gap-1.5 w-fit">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">{t('common', 'year')}</span>
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger className="w-full md:w-fit cursor-pointer min-w-[100px] bg-white/5 border-white/10 rounded-md text-xs font-semibold text-white hover:bg-white/10 transition-all focus:ring-0 focus:ring-offset-0">
                                            <SelectValue placeholder={t('common', 'year')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white rounded-md p-1 shadow-2xl">
                                            <SelectItem value="all" className="text-xs focus:bg-white/10 focus:text-white cursor-pointer">
                                                {t('common', 'year')}
                                            </SelectItem>
                                            {years.map((y) => (
                                                <SelectItem
                                                    key={y}
                                                    value={y.toString()}
                                                    className="text-xs focus:bg-white/10 focus:text-white cursor-pointer"
                                                >
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sort Options */}
                                <div className="flex flex-col gap-1.5 md:w-fit">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">
                                        {t('common', 'sortBy')}
                                    </span>
                                    <div className="flex w-fit items-center gap-1 bg-white/5 border border-white/10 rounded-md">
                                        <Select
                                            value={sortBy}
                                            onValueChange={(value) => setSortBy(value as SortField)}
                                        >
                                            <SelectTrigger className="h-9 border-0 bg-transparent text-white text-xs font-semibold focus:ring-0 focus:ring-offset-0 cursor-pointer min-w-[140px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900/95 border-white/10 text-white rounded-xl shadow-2xl p-1">
                                                {sortOptions.map((opt) => (
                                                    <SelectItem
                                                        key={opt.key}
                                                        value={opt.key}
                                                        className="text-xs focus:bg-white/10 focus:text-white cursor-pointer px-2.5"
                                                    >
                                                        {t('common', opt.label)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="w-px h-4 bg-white/10" />

                                        <button
                                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                                            aria-label="Toggle Sort Order"
                                        >
                                            {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 hidden md:block" />

                                {/* Export and Other Actions */}
                                <div className="flex flex-col gap-1.5 md:w-fit md:justify-end">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1 md:text-right">{t('common', 'actions')}</span>
                                    <button
                                        onClick={handleExport}
                                        disabled={isExporting}
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
                                        aria-label="Export all to Excel"
                                        title="Export all to Excel"
                                    >
                                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                        <span>{t('common', 'exportAll')}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── LIBRARY CONTENT ─── */}
                {status === 'pending' ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
                    </div>
                ) : libraryData.length > 0 ? (
                    <div className="flex flex-col gap-10 mt-10">
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
                                    <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">{t('common', 'loading')}</span>
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
                        <h3 className="text-white text-xl font-bold mb-2">{selectedGenre !== 'all' || selectedYear !== 'all' ? t('common', 'yourRequestHasNoResults') : t('common', 'your') + t('common', activeCategory) + t('common', 'isEmpty')}</h3>
                        <p className="text-zinc-500 text-sm max-w-xs mb-3">{selectedGenre !== 'all' || selectedYear !== 'all' ? t('common', 'tryAdjustingYourFilters') : ''}{selectedGenre === 'all' && selectedYear === 'all' ? t('common', 'startExploring') : t('common', 'startExploring').toLowerCase()} {t('common', 'movies')} {t('common', 'and')} {t('common', 'series')} {t('common', 'toAdd')}</p>
                        <div className="flex gap-2 flex-col items-center">
                            {(selectedGenre !== 'all' || selectedYear !== 'all') &&
                                <button onClick={() => { setShowFilters(false); setMediaType('all'); setSelectedGenre('all'); setSelectedYear('all'); }}
                                    className="cursor-pointer px-2 py-1 text-white border border-white/50 rounded-lg hover:bg-white/20 transition-colors">
                                    {t('common', 'resetFilters')}
                                </button>
                            }
                            <div className="flex gap-2 items-center">
                                <span>{t('common', 'explore')}</span>
                                <div className="flex gap-2 ">
                                    <Link href="/movies" className=" text-white border border-white/50 rounded-sm px-2 hover:bg-white/20 transition-colors">
                                        {t('common', 'movies')}
                                    </Link>
                                    <Link href="/tvseries" className=" text-white border border-white/50 rounded-sm px-2 hover:bg-white/20 transition-colors">
                                        {t('common', 'series')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}