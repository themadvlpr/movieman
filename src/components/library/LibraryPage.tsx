'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { Grid, List, Filter, ArrowUp, ArrowDown, Download, Loader2, X, Pencil, Trash2, Check } from "lucide-react"
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams, usePathname } from 'next/navigation';
import { useLocalizedRouter as useRouter } from '@/components/navigation/useRouter';
import { updateViewMode } from "@/lib/tmdb/cookies-actions"
import { getLibraryAction } from "@/lib/actions/getLibraryAction"
import { exportAllUserMediaAction } from "@/lib/actions/exportAllUserMediaAction"
import { getUserListsAction, renameUserListAction, deleteUserListAction } from "@/lib/actions/userListsActions"
import { LocalizedLink as Link } from '@/components/navigation/Link'
import * as XLSX from "xlsx"
import { toast } from "sonner"
import { useTranslation } from "@/providers/LocaleProvider"
import { getLocalizedUrl } from "@/lib/i18n/url-utils"
import MediaVirtualList from "@/components/movie-tv/MediaVirtualList"
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig"
import MediaCard from "@/components/movie-tv/MediaCard"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import ShareButton from "@/components/ui/ShareButton"

const libraries = [
    { key: 'watched' },
    { key: 'wishlist' },
    { key: 'favorite' },
]



// Contextual scroll state to handle "Back" vs "New" navigation
let _libraryScrollState = { offset: 0, params: "" }

interface Props {
    initialViewMode: 'grid' | 'list';
    userId: string;
    encryptedUserId?: string;
    sessionUserId?: string;
    isPublic?: boolean;
    publicProfile?: { name: string, image: string | null, sharedListName?: string };
}

type SortField = 'title' | 'watchedDate' | 'year' | 'userRating' | 'rating';
type SortOrder = 'asc' | 'desc';
type MediaType = 'all' | 'movie' | 'tv';

export default function LibraryPage({ initialViewMode, userId, encryptedUserId, sessionUserId, isPublic = false, publicProfile }: Props) {

    const sortOptions = [
        { key: 'title', label: 'name' },
        ...(isPublic ? [] : [{ key: 'watchedDate', label: 'watchDate' }]),
        { key: 'year', label: 'releaseDate' },
        { key: 'userRating', label: 'userRating' },
        { key: 'rating', label: 'tmdbRating' },
    ];

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { t, locale } = useTranslation()

    const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
    const [isExporting, setIsExporting] = useState(false);

    const [showFilters, setShowFilters] = useState(false);

    const { data: userLists = [] } = useQuery({
        queryKey: ['library-user-lists', isPublic ? sessionUserId : userId],
        queryFn: async () => await getUserListsAction(),
        enabled: isPublic ? !!sessionUserId : !!userId,
        staleTime: 1000 * 60 * 5,
    });

    const [activeCategory, setActiveCategory] = useState<string>(() => {
        const urlCategory = searchParams.get('category');
        if (urlCategory && (['watched', 'wishlist', 'favorite'].includes(urlCategory) || urlCategory.startsWith('list_'))) return urlCategory;
        return 'watched';
    });

    const [mediaType, setMediaType] = useState<MediaType>(() => {
        const urlType = searchParams.get('type') as MediaType;
        if (['all', 'movie', 'tv'].includes(urlType)) return urlType;
        return 'all';
    });

    const [sortBy, setSortBy] = useState<SortField>(() => {
        const urlSort = searchParams.get('sort') as SortField;
        if (['title', 'watchedDate', 'year', 'userRating', 'rating'].includes(urlSort)) return isPublic ? 'year' : urlSort;
        return isPublic ? 'year' : 'watchedDate'; // Default sort is usually newest watch date for Watched category
    });

    const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
        const urlOrder = searchParams.get('order') as SortOrder;
        if (['asc', 'desc'].includes(urlOrder)) return urlOrder;
        return 'desc';
    });

    const [selectedGenre, setSelectedGenre] = useState<string>(() => searchParams.get('genre') || 'all');
    const [selectedYear, setSelectedYear] = useState<string>(() => searchParams.get('year') || 'all');

    const queryClient = useQueryClient();
    const [isEditingList, setIsEditingList] = useState(false);
    const [editListName, setEditListName] = useState("");

    const activeListId = activeCategory.startsWith('list_') ? activeCategory.slice(5) : null;
    const activeList = activeListId ? userLists.find((l: any) => l.id === activeListId) : null;

    useEffect(() => {
        if (activeList && !isEditingList) {
            setEditListName(activeList.name);
        }
    }, [activeList, isEditingList]);

    const { mutate: renameList, isPending: isRenaming } = useMutation({
        mutationFn: async ({ listId, newName }: { listId: string, newName: string }) => {
            return await renameUserListAction(listId, newName);
        },
        onSuccess: (res) => {
            if (res.success) {
                toast.success(t('common', 'listRenamed') || "List renamed");
                queryClient.invalidateQueries({ queryKey: ['library-user-lists'] });
                setIsEditingList(false);
            } else {
                toast.error(res.error || "Failed to rename list");
            }
        }
    });

    const { mutate: deleteList, isPending: isDeleting } = useMutation({
        mutationFn: async (listId: string) => {
            return await deleteUserListAction(listId);
        },
        onSuccess: (res) => {
            if (res.success) {
                toast.success(t('common', 'listDeleted') || "List deleted");
                queryClient.invalidateQueries({ queryKey: ['library-user-lists'] });
                setActiveCategory('watched');
            } else {
                toast.error(res.error || "Failed to delete list");
            }
        }
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
        if (params.get('genre') !== selectedGenre) { params.set('genre', selectedGenre); changed = true; }
        if (params.get('year') !== selectedYear) { params.set('year', selectedYear); changed = true; }

        if (changed) {
            router.replace(pathname + '?' + params.toString(), { scroll: false });
        }
    }, [activeCategory, mediaType, sortBy, sortOrder, selectedGenre, selectedYear, pathname, router, searchParams]);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            toast.loading(t('common', 'gatheringAllYourMedia'));

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

            toast.success(t('common', 'libraryExportedSuccessfully'));
        } catch (error) {
            console.error("Export Error: ", error);
            toast.dismiss();
            toast.error("Failed to export library");
        } finally {
            setIsExporting(false);
        }
    };

    // Infinite scroll is now handled internally by LibraryPageList virtualization

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['library-list', activeCategory, mediaType, sortBy, sortOrder, locale, selectedGenre, selectedYear, sessionUserId, isPublic],
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
                selectedYear !== 'all' ? selectedYear : null,
                sessionUserId
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
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnMount: false, // Ensure we use cache immediately when going back
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
        _libraryScrollState = {
            offset: window.scrollY,
            params: searchParams.toString()
        };
    }, [searchParams]);

    // Infinite scroll state trackers


    const currentCategoryDataCount = (type: 'tv' | 'movie') => {
        // We only show counts for standard categories right now. For custom lists, returning total directly from results or leaving empty.
        if (activeCategory.startsWith('list_')) {
            return type === 'tv' ? (data?.pages[0]?.results.filter(r => r.media_type === 'tv').length || 0) : (data?.pages[0]?.results.filter(r => r.media_type === 'movie').length || 0);
        }

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
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                    <h1 className="text-3xl sm:text-5xl font-bold flex flex-wrap items-center gap-3 sm:gap-6">
                        {isPublic ? (
                            <div className="flex items-center gap-4">
                                {publicProfile?.image ? (
                                    <img src={publicProfile.image} alt={publicProfile.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white/10" />
                                ) : (
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 border-2 border-white/10 flex items-center justify-center">
                                        <span className="text-xl sm:text-3xl font-bold text-white">{publicProfile?.name?.[0]?.toUpperCase() || '?'}</span>
                                    </div>
                                )}
                                <span>{publicProfile?.sharedListName ? publicProfile.sharedListName : `${publicProfile?.name?.split(' ')[0]}: ${t('nav', 'library').split(' ')[1].toLowerCase()}`}</span>
                            </div>
                        ) : (
                            <span>{t('nav', 'library')}</span>
                        )}
                    </h1>

                    {!isPublic && (
                        <ShareButton
                            title={(activeCategory.startsWith('list_') ? userLists.find((list: any) => list.id === activeCategory.slice(5))?.name : t('common', 'shareLibrary')) || ''}
                            buttonText={(activeCategory.startsWith('list_') ? t('common', 'share') + ' ' + userLists.find((list: any) => list.id === activeCategory.slice(5))?.name : t('common', 'shareLibrary')) || ''}
                            currentUrl={getLocalizedUrl(`/sharelist/${encryptedUserId || userId}?category=${activeCategory}`, locale)}
                        />
                    )}
                </div>
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
                    <div className="flex flex-wrap items-center gap-2">
                        {isPublic && publicProfile?.sharedListName ? (
                            <div className="flex items-center gap-1 w-full sm:w-fit bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1 overflow-x-auto no-scrollbar">
                                <button className="relative px-2 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-default whitespace-nowrap bg-white text-black shadow-lg shadow-white/10">
                                    <span className="relative z-10">{publicProfile.sharedListName}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 w-full sm:w-fit bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1 overflow-x-auto no-scrollbar">
                                {libraries.map((cat) => (
                                    <button
                                        key={cat.key}
                                        onClick={() => setActiveCategory(cat.key)}
                                        className={`relative flex-1 sm:flex-none px-2 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap
                                            ${activeCategory === cat.key
                                                ? 'bg-white text-black shadow-lg shadow-white/10'
                                                : 'text-zinc-400 hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        <span className="relative z-10">{t('common', cat.key)}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {!isPublic && userLists.length > 0 && (
                            <div className="w-fit flex items-center gap-1">
                                {!isEditingList ? (
                                    <Select
                                        value={activeCategory.startsWith('list_') ? activeCategory : ''}
                                        onValueChange={(val) => setActiveCategory(val)}
                                    >
                                        <SelectTrigger className={`h-full py-2.5 px-2 sm:py-5 sm:px-3 cursor-pointer min-w-[140px] rounded-lg text-xs sm:text-sm font-semibold transition-all focus:ring-0 focus:ring-offset-0 ${activeCategory.startsWith('list_') ? 'bg-white text-black border-white shadow-lg shadow-white/10' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 backdrop-blur-md border border-white/10'}`}>
                                            <SelectValue placeholder={t('common', 'myLists')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900/95 border-white/10 text-white rounded-md shadow-2xl p-1">
                                            {userLists.map((l) => (
                                                <SelectItem
                                                    key={l.id}
                                                    value={`list_${l.id}`}
                                                    className="text-xs sm:text-sm focus:bg-white/10 focus:text-white cursor-pointer px-2.5 py-1.5"
                                                >
                                                    {l.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editListName}
                                            onChange={(e) => setEditListName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    if (editListName.trim() && activeListId) {
                                                        renameList({ listId: activeListId, newName: editListName.trim() });
                                                    }
                                                } else if (e.key === 'Escape') {
                                                    setIsEditingList(false);
                                                }
                                            }}
                                            className="h-full py-1.5 px-2 sm:py-4.5 sm:px-3 text-xs sm:text-sm min-w-[140px] bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:border-white transition-all w-36"
                                        />
                                        <button
                                            disabled={isRenaming || !editListName.trim() || editListName === activeList?.name}
                                            onClick={() => activeListId && renameList({ listId: activeListId, newName: editListName.trim() })}
                                            className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isRenaming ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />}
                                        </button>
                                        <button
                                            onClick={() => setIsEditingList(false)}
                                            className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                                        </button>
                                    </div>
                                )}

                                {activeCategory.startsWith('list_') && !isEditingList && !isPublic && (
                                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1 backdrop-blur-md h-full">
                                        <button
                                            onClick={() => setIsEditingList(true)}
                                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                                            title={t('common', 'editList') || "Edit list"}
                                        >
                                            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(t('common', 'areYouSure') || "Are you sure you want to delete this list?")) {
                                                    if (activeListId) deleteList(activeListId);
                                                }
                                            }}
                                            disabled={isDeleting}
                                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={t('common', 'deleteList') || "Delete list"}
                                        >
                                            {isDeleting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
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

                <div className="flex gap-3 flex-wrap">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">
                            {t('common', 'filter')}
                        </span>
                        <div className={`group w-fit flex items-center border transition-all duration-300 rounded-md overflow-hidden ${showFilters
                            ? 'bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                            : 'bg-white/5 backdrop-blur-md border-white/10'
                            }`}>

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

                            {(selectedGenre !== 'all' || selectedYear !== 'all') && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
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
                                    {sortOptions.map((opt) => opt && (
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
                                    <div className="relative group">
                                        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                                            <SelectTrigger className={`w-full md:w-fit cursor-pointer min-w-[130px] bg-white/5 border-white/10 rounded-md text-xs font-semibold text-white hover:bg-white/10 transition-all focus:ring-0 focus:ring-offset-0 ${selectedGenre !== 'all' ? 'pr-9' : ''}`}>
                                                <SelectValue placeholder={t('common', 'genre')} />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white rounded-md shadow-2xl p-1">
                                                <SelectItem value="all" className="text-xs focus:bg-white/10 focus:text-white cursor-pointer">
                                                    {t('common', 'genre')}
                                                </SelectItem>
                                                {genres.map((g) => (
                                                    <SelectItem key={g.id} value={g.id.toString()} className="text-xs focus:bg-white/10 focus:text-white cursor-pointer">
                                                        {g.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedGenre !== 'all' && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedGenre('all');
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:text-white text-zinc-500 transition-colors z-20 cursor-pointer"
                                            >
                                                <X className="w-3 h-3 stroke-[3px]" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Year Filter */}
                                <div className="flex flex-col gap-1.5 w-fit">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">{t('common', 'year')}</span>
                                    <div className="relative group">
                                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                                            <SelectTrigger className={`w-full md:w-fit cursor-pointer min-w-[100px] bg-white/5 border-white/10 rounded-md text-xs font-semibold text-white hover:bg-white/10 transition-all focus:ring-0 focus:ring-offset-0 ${selectedYear !== 'all' ? 'pr-9' : ''}`}>
                                                <SelectValue placeholder={t('common', 'year')} />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white rounded-md p-1 shadow-2xl">
                                                <SelectItem value="all" className="text-xs focus:bg-white/10 focus:text-white cursor-pointer">
                                                    {t('common', 'year')}
                                                </SelectItem>
                                                {years.map((y) => (
                                                    <SelectItem key={y} value={y.toString()} className="text-xs focus:bg-white/10 focus:text-white cursor-pointer">
                                                        {y}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedYear !== 'all' && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedYear('all');
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:text-white text-zinc-500 transition-colors z-20 cursor-pointer"
                                            >
                                                <X className="w-3 h-3 stroke-[3px]" />
                                            </button>
                                        )}
                                    </div>
                                </div>



                                <div className="flex-1 hidden md:block" />

                                <div className="flex flex-col gap-1.5 md:w-fit md:justify-end">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1 md:text-right">{t('common', 'actions')}</span>
                                    <div className="flex items-center gap-2">
                                        {!isPublic && (
                                            <>
                                                <button
                                                    onClick={handleExport}
                                                    disabled={isExporting}
                                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5 whitespace-nowrap"
                                                    aria-label="Export all to Excel"
                                                    title="Export all to Excel"
                                                >
                                                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                    <span>{t('common', 'exportAll')}</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {status === 'pending' && libraryData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
                    </div>
                ) : libraryData.length > 0 ? (
                    <MediaVirtualList
                        status={status}
                        items={libraryData}
                        viewMode={viewMode}
                        activeCategory={activeCategory}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                        t={t}
                        renderCard={(item, globalIndex) => (
                            <MediaCard
                                key={`${item.id}-${globalIndex}`}
                                item={item}
                                idx={globalIndex}
                                isLibrary={true}
                                viewMode={viewMode}
                                userId={userId}
                                sessionUserId={sessionUserId}
                                isPublic={isPublic}
                                publicName={publicProfile?.name.split(' ')[0] || ''}
                                onItemClick={handleItemClick}
                            />
                        )}
                        restoreScrollOffset={_libraryScrollState.params === searchParams.toString() ? _libraryScrollState.offset : 0}
                        onScrollRestored={() => { _libraryScrollState = { offset: 0, params: "" } }}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                            <Filter className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">{selectedGenre !== 'all' || selectedYear !== 'all' ? t('common', 'yourRequestHasNoResults') : t('common', 'your') + (activeCategory.startsWith('list_') ? userLists.find((list) => list.id === activeCategory.slice(5))?.name : t('common', activeCategory)) + t('common', 'isEmpty')}</h3>
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