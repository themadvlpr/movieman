import { Grid, List, Loader2, X, Pencil, Trash2, Check } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateViewMode } from "@/lib/tmdb/cookies-actions"

type MediaType = 'all' | 'movie' | 'tv';

const libraries = [
    { key: 'watched' },
    { key: 'wishlist' },
    { key: 'favorite' },
]

interface CategoriesProps {
    activeCategory: string;
    setActiveCategory: (category: string) => void;
    userLists: any[];
    isPublic: boolean;
    publicProfile?: any;
    editListName: string;
    setEditListName: (name: string) => void;
    isEditingList: boolean;
    setIsEditingList: (editing: boolean) => void;
    renameList: ({ listId, newName }: { listId: string, newName: string }) => void;
    deleteList: (listId: string) => void;
    isRenaming: boolean;
    isDeleting: boolean;
    t: (category: string, key: string) => string;
    activeList: { id: string; name: string; isActive: boolean; } | null | undefined
    activeListId: string | null;
    mediaType: string;
    setMediaType: (mediaType: MediaType) => void;
    viewMode: 'grid' | 'list';
    setViewMode: (viewMode: 'grid' | 'list') => void;
}

export default function Categories({
    activeCategory,
    setActiveCategory,
    userLists,
    isPublic,
    publicProfile,
    editListName,
    setEditListName,
    isEditingList,
    setIsEditingList,
    renameList,
    deleteList,
    isRenaming,
    isDeleting,
    activeListId,
    activeList,
    mediaType,
    setMediaType,
    viewMode,
    setViewMode,
    t,
}: CategoriesProps) {

    const toggleView = async (mode: 'grid' | 'list') => {
        const newMode = mode === 'grid' ? 'grid' : 'list'
        setViewMode(newMode)
        await updateViewMode(newMode, 'library')
    }

    return (
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
    )
}