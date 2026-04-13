import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserListsAction, createUserListAction, toggleMediaInListAction } from "@/lib/actions/userListsActions";
import { dbState } from "@/lib/tmdb/types/db-types";
import { toast } from "sonner";

export interface UserListWithStatus {
    id: string;
    name: string;
    isActive: boolean;
}

export function useUserLists(
    mediaId: number | undefined,
    userId: string | undefined,
    type: 'movie' | 'tv'
) {
    const queryClient = useQueryClient();
    const queryKey = ["user-lists", mediaId, userId];

    const { data: userLists = [], isLoading } = useQuery({
        queryKey,
        queryFn: async () => {
            if (!userId) return [];
            return await getUserListsAction(mediaId);
        },
        enabled: !!userId,
        staleTime: 1000 * 60, // 1 minute
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ listId, mediaData }: { listId: string, mediaData: dbState }) => {
            if (!mediaId) throw new Error("No media id");
            return await toggleMediaInListAction(listId, mediaId, type, mediaData);
        },
        onMutate: async ({ listId }) => {
            await queryClient.cancelQueries({ queryKey });
            const previousLists = queryClient.getQueryData<UserListWithStatus[]>(queryKey);

            if (previousLists) {
                queryClient.setQueryData<UserListWithStatus[]>(queryKey, 
                    previousLists.map(list => 
                        list.id === listId ? { ...list, isActive: !list.isActive } : list
                    )
                );
            }

            return { previousLists };
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['library-list'] });
            
            const listName = userLists.find(l => l.id === variables.listId)?.name || "List";
            const title = variables.mediaData.titleEn || variables.mediaData.titleRu || variables.mediaData.titleUk || "Media";

            if (data.isNowActive) {
                toast.success(`Added to ${listName}`, { description: title });
            } else {
                toast.info(`Removed from ${listName}`, { description: title });
            }
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(queryKey, context?.previousLists);
            toast.error("Failed to update list", { description: "Please try again later." });
        },
    });

    const createListMutation = useMutation({
        mutationFn: async (name: string) => {
            return await createUserListAction(name);
        },
        onSuccess: (result) => {
            if (result.success && result.data) {
                toast.success(`List "${result.data.name}" created!`);
                queryClient.setQueryData<UserListWithStatus[]>(queryKey, (old = []) => {
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

    return {
        userLists,
        isLoading,
        toggleListAction: (listId: string, mediaData: dbState) => toggleMutation.mutate({ listId, mediaData }),
        createListAction: (name: string) => createListMutation.mutate(name)
    };
}
