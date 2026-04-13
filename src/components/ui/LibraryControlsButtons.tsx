'use client'

import { Bookmark, Eye, Heart, Plus, ListPlus, Check, Loader2 } from "lucide-react"
import { useState } from "react"
import { useMediaActions } from "@/hooks/useDbStates"
import { useUserLists } from "@/hooks/useUserLists"
import { dbState, dbMediaStatus } from "@/lib/tmdb/types/db-types"
import { useTranslation } from "@/providers/LocaleProvider"
import { cn } from "@/lib/utils"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface LibraryControlsButtonsProps {
    mediaId: number;
    mediaData: dbState;
    initialState: dbMediaStatus;
    type: "movie" | "tv";
    detailPage?: boolean;
    userId?: string;
}

export default function LibraryControlsButtons({
    mediaId,
    mediaData,
    type,
    initialState,
    detailPage = true,
    userId = ""
}: LibraryControlsButtonsProps) {

    if (!userId) return null;

    const { t } = useTranslation();
    const { dbState, toggleAction } = useMediaActions(mediaId, userId, type, initialState);
    const { userLists, isLoading, toggleListAction, createListAction } = useUserLists(mediaId, userId, type);

    const [isCreatingList, setIsCreatingList] = useState(false);
    const [newListName, setNewListName] = useState("");

    const toggleList = (listId: string) => {
        toggleListAction(listId, mediaData);
    };

    const handleCreateList = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListName.trim()) return;
        createListAction(newListName.trim());
        setNewListName("");
        setIsCreatingList(false);
    };

    const hideWatched = mediaData.releaseDate && new Date(mediaData.releaseDate).toISOString().split('T')[0] > new Date().toISOString().split('T')[0];

    const states = {
        watched: !!dbState?.isWatched,
        wishlist: !!dbState?.isWishlist,
        favorite: !!dbState?.isFavorite,
    };

    const getButtonClass = (isActive: boolean) => {
        const baseClass = "p-2 rounded-sm border backdrop-blur-md transition-all active:scale-90 cursor-pointer group"
        return isActive
            ? `${baseClass} bg-white text-zinc-950 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]`
            : `${baseClass} bg-white/10 text-zinc-200 border-white/10 hover:bg-white/20 hover:text-white hover:border-white/30`;
    };

    const iconClass = "w-4 h-4";

    return (
        <div className={`flex items-center gap-1.5 lg:gap-3`}>
            {!hideWatched && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleAction('isWatched', mediaData) }}
                    className={detailPage
                        ? `flex items-center gap-2.5 px-6 py-2.75 rounded-md font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 cursor-pointer ${states.watched ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white border border-white/10'}`
                        : getButtonClass(states.watched)
                    }
                >
                    <Eye strokeWidth={3} className={cn("w-3.5 h-3.5", states.watched && "fill-current")} />
                    {detailPage && (states.watched ? t("common", 'watched') : t("common", 'markAsWatched'))}
                </button>
            )}

            <button
                type="button"
                onClick={() => toggleAction('isFavorite', mediaData)}
                className={getButtonClass(states.favorite)}
            >
                <Heart className={cn(iconClass, states.favorite && "fill-current")} strokeWidth={2.5} />
            </button>

            <button
                type="button"
                onClick={() => toggleAction('isWishlist', mediaData)}
                className={getButtonClass(states.wishlist)}
            >
                <Bookmark className={cn(iconClass, states.wishlist && "fill-current")} strokeWidth={2.5} />
            </button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button type="button" className={getButtonClass(false)}>
                        <Plus className={iconClass} strokeWidth={2.5} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-950/90 border-white/10 backdrop-blur-xl text-zinc-200 shadow-2xl">
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest opacity-50 px-3 py-2">
                        {t("common", "addToCollection")}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5" />

                    {isLoading ? (
                        <div className="flex items-center justify-center p-3 opacity-50">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    ) : (
                        userLists.map((list) => (
                            <DropdownMenuItem
                                key={list.id}
                                onSelect={(e) => e.preventDefault()}
                                className="flex items-center justify-between px-3 py-2 text-xs focus:bg-white/10 focus:text-white cursor-pointer group"
                                onClick={() => toggleList(list.id)}
                            >
                                <div className="flex items-center gap-2">
                                    <ListPlus className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                                    <span>{list.name}</span>
                                </div>
                                {list.isActive && (
                                    <Check className="h-3.5 w-3.5 text-blue-400" strokeWidth={3} />
                                )}
                            </DropdownMenuItem>
                        ))
                    )}

                    <DropdownMenuSeparator className="bg-white/5" />

                    {!isCreatingList ? (
                        <DropdownMenuItem 
                            onClick={(e) => { e.preventDefault(); setIsCreatingList(true); }}
                            className="px-3 py-2 text-xs text-blue-400 focus:bg-blue-500/10 focus:text-blue-300 cursor-pointer"
                        >
                            <Plus className="mr-2 h-3.5 w-3.5" />
                            <span>Создать новый список</span>
                        </DropdownMenuItem>
                    ) : (
                        <div className="px-3 py-2">
                            <form onSubmit={handleCreateList} className="flex flex-col gap-2">
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    placeholder="Имя списка..."
                                    className="w-full bg-black/50 border border-white/20 rounded-md px-2 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/50"
                                />
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setIsCreatingList(false)} className="flex-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-md text-[10px] uppercase cursor-pointer">Отмена</button>
                                    <button type="submit" className="flex-1 px-2 py-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 rounded-md text-[10px] uppercase cursor-pointer">Создать</button>
                                </div>
                            </form>
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}