'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { Filter } from "lucide-react"
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearchParams, usePathname } from 'next/navigation';
import { useLocalizedRouter as useRouter } from '@/components/navigation/useRouter';
import { getLibraryAction } from "@/lib/actions/getLibraryAction"
import { getUserListsAction, renameUserListAction, deleteUserListAction } from "@/lib/actions/userListsActions"
import { LocalizedLink as Link } from '@/components/navigation/Link'
import { toast } from "sonner"
import { useTranslation } from "@/providers/LocaleProvider"
import { getLocalizedUrl } from "@/lib/i18n/url-utils"
import MediaVirtualList from "@/components/movie-tv/MediaVirtualList"
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig"
import MediaCard from "@/components/movie-tv/MediaCard"
import MediaCardSkeleton from "@/components/movie-tv/MediaCardSkeleton"

import ShareButton from "@/components/ui/ShareButton"
import SortFilters from "@/components/library/SortFilters"
import Categories from "@/components/library/Categories"






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
                    {(mediaType === 'all' || mediaType === 'movie') && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500">{t('common', 'movies')}</span>
                            <span className="text-sm sm:text-base font-bold text-zinc-300">{status === 'pending' ?
                                <div className="w-4 h-4 rounded-full border-2 border-white/10 border-t-white/30 animate-spin" /> :
                                currentCategoryDataCount('movie') || '-'}
                            </span>
                        </div>
                    )}
                    {(mediaType === 'all' || mediaType === 'tv') && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500">{t('common', 'series')}</span>
                            <span className="text-sm sm:text-base font-bold text-zinc-300">{status === 'pending' ?
                                <div className="w-4 h-4 rounded-full border-2 border-white/10 border-t-white/30 animate-spin" /> :
                                currentCategoryDataCount('tv') || '-'}
                            </span>
                        </div>
                    )}
                </div>

                <Categories
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    userLists={userLists}
                    isPublic={isPublic}
                    publicProfile={publicProfile}
                    editListName={editListName}
                    setEditListName={setEditListName}
                    isEditingList={isEditingList}
                    setIsEditingList={setIsEditingList}
                    renameList={renameList}
                    deleteList={deleteList}
                    isRenaming={isRenaming}
                    isDeleting={isDeleting}
                    activeListId={activeListId}
                    activeList={activeList}
                    mediaType={mediaType}
                    setMediaType={setMediaType}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    t={t}
                />

                <SortFilters
                    t={t}
                    isPublic={isPublic}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    selectedGenre={selectedGenre}
                    setSelectedGenre={setSelectedGenre}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    setIsExporting={setIsExporting}
                    userId={userId}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    isExporting={isExporting}
                    locale={locale}
                />

                {status === 'pending' && libraryData.length === 0 ? (
                    <div className={viewMode === 'grid' 
                        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 pb-20 mt-15"
                        : "flex flex-col gap-3 sm:gap-4 pb-20 mt-15"}>
                        {[...Array(12)].map((_, i) => (
                            <MediaCardSkeleton key={i} viewMode={viewMode} />
                        ))}
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
                        {!isPublic && <>
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
                        </>}
                    </div>
                )}
            </div>
        </div>
    )
}