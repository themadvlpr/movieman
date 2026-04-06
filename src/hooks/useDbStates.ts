import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toggleMediaStatusAction } from "@/lib/actions/toggleMediaStatus";
import { dbMediaStatus, dbState } from "@/lib/tmdb/types/db-types";
import { toast } from "sonner";

export function useMediaActions(
    mediaId: number,
    userId: string | undefined,
    type: 'movie' | 'tv',
    initialState?: dbMediaStatus
) {
    const queryClient = useQueryClient();
    const queryKey = ["media-state", mediaId, userId];

    const actionLabels: Record<string, string> = {
        isWatched: "Watched",
        isFavorite: "Favorite",
        isWishlist: "Wishlist"
    };

    const { data: currentDbState } = useQuery({
        queryKey,
        queryFn: async () => {
            const res = await fetch(`/api/db?mediaId=${mediaId}&userId=${userId}&type=${type}`);
            return res.json();
        },
        initialData: initialState,
        enabled: !!userId,
        staleTime: Infinity,
    });

    const mutation = useMutation({
        mutationFn: async ({ action, mediaData }: { action: string, mediaData: dbState }) => {
            return await toggleMediaStatusAction(mediaId, action, type, mediaData);
        },
        onMutate: async ({ action }) => {
            await queryClient.cancelQueries({ queryKey });
            const previous = queryClient.getQueryData<dbMediaStatus>(queryKey);

            queryClient.setQueryData<dbMediaStatus>(queryKey, (old) => {
                if (!old) return initialState;
                return { ...old, [action]: !old[action as keyof dbMediaStatus] };
            });

            return { previous };
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['library-list'] });

            const { action, mediaData } = variables;
            const isNowActive = queryClient.getQueryData<dbMediaStatus>(queryKey)?.[action as keyof dbMediaStatus];

            const label = actionLabels[action] || "Library";
            const title = mediaData.titleEn || mediaData.titleRu || mediaData.titleUk || "Media";

            if (isNowActive) {
                toast.success(`Added to ${label}`, {
                    description: title,
                });
            } else {
                toast.info(`Removed from ${label}`, {
                    description: title,
                });
            }
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(queryKey, context?.previous);
            toast.error("Failed to update library", {
                description: "Please try again later."
            });
        },
    });

    return {
        dbState: currentDbState,
        toggleAction: (action: string, mediaData: dbState) =>
            mutation.mutate({ action, mediaData })
    };
}