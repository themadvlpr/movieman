import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserListsAction, createUserListAction, toggleMediaInListAction } from "@/lib/actions/userListsActions";
import { dbState } from "@/lib/tmdb/types/db-types";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/providers/LocaleProvider";

export interface UserListWithStatus {
    id: string;
    name: string;
    isActive: boolean;
}

const EMPTY_ARRAY: string[] = [];

export function useUserLists(
    mediaId: number | undefined,
    userId: string | undefined,
    type: 'movie' | 'tv',
    initialListIds: string[] = EMPTY_ARRAY
) {
    const queryClient = useQueryClient();
    const globalListsKey = ["user-lists", userId];

    const { t, locale } = useTranslation();


    // 1. Fetch ALL user lists (names/IDs) once
    const { data: allLists = [], isLoading } = useQuery({
        queryKey: globalListsKey,
        queryFn: async () => {
            if (!userId) return [];
            const result = await getUserListsAction();
            return result;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // 2. Track which lists this specific media belongs to
    const [activeListIds, setActiveListIds] = useState<string[]>(initialListIds);
    const prevInitialIdsRef = useRef(JSON.stringify(initialListIds));

    // Sync state when initial data changes (e.g. from server/parent update)
    // We only sync if the initialListIds prop itself has changed
    useEffect(() => {
        const currentInitialIdsStr = JSON.stringify(initialListIds);
        if (currentInitialIdsStr !== prevInitialIdsRef.current) {
            setActiveListIds(initialListIds);
            prevInitialIdsRef.current = currentInitialIdsStr;
        }
    }, [initialListIds]);

    const toggleMutation = useMutation({
        mutationFn: async ({ listId, mediaData }: { listId: string, mediaData: dbState }) => {
            if (!mediaId) throw new Error("No media id");
            return await toggleMediaInListAction(listId, mediaId, type, mediaData);
        },
        onMutate: async ({ listId }) => {
            const previousActiveIds = [...activeListIds];

            // Optimistic update
            setActiveListIds(prev =>
                prev.includes(listId)
                    ? prev.filter(id => id !== listId)
                    : [...prev, listId]
            );

            return { previousActiveIds };
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['library-list'] });

            const listName = allLists.find(l => l.id === variables.listId)?.name || "List";
            const title = variables.mediaData.titleEn || variables.mediaData.titleRu || variables.mediaData.titleUk || "Media";

            if (data.isNowActive) {
                toast.success(`${t('common', 'addedTo')} ${listName}`, { description: title });
            } else {
                toast.info(`${t('common', 'removedFrom')} ${listName}`, { description: title });
            }
        },
        onError: (err, variables, context) => {
            if (context?.previousActiveIds) {
                setActiveListIds(context.previousActiveIds);
            }
            toast.error("Failed to update list", { description: "Please try again later." });
        },
    });

    const createListMutation = useMutation({
        mutationFn: async (name: string) => {
            return await createUserListAction(name);
        },
        onSuccess: (result) => {
            if (result.success && result.data) {
                toast.success(`${t('common', 'list')} "${result.data.name}" ${t('common', 'created')}`);
                // Update global lists query to include the new list
                queryClient.setQueryData<UserListWithStatus[]>(globalListsKey, (old = []) => {
                    return [result.data as UserListWithStatus, ...old];
                });
            } else {
                toast.error(result.error || "Failed to create list");
            }
        },
        onError: () => {
            toast.error("Failed to create list");
        }
    });

    // Construct the combined view for the UI
    const userLists = allLists.map(list => ({
        ...list,
        isActive: activeListIds.includes(list.id)
    }));

    return {
        userLists,
        isLoading,
        activeListIds,
        toggleListAction: (listId: string, mediaData: dbState) => toggleMutation.mutate({ listId, mediaData }),
        createListAction: (name: string) => createListMutation.mutate(name)
    };
}
