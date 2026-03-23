import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface MediaData {
    title: string;
    poster: string | null;
    rating: number;
    year?: string;
}

export function useMediaActions(mediaId: number, userId: string | undefined, type: string) {
    const queryClient = useQueryClient();

    // Запрос состояния из БД
    const { data: dbState, isLoading } = useQuery({
        queryKey: ["media-state", mediaId, userId],
        queryFn: async () => {
            const res = await fetch(`/api/db?mediaId=${mediaId}&userId=${userId}&type=${type}`);
            if (!res.ok) return null;
            return res.json();
        },
        enabled: !!userId,
        staleTime: 0,
    });

    // Мутация для изменения состояния
    const mutation = useMutation({
        mutationFn: async ({ action, mediaData }: { action: string, mediaData: MediaData }) => {
            const res = await fetch("/api/db", {
                method: "POST",
                body: JSON.stringify({
                    mediaId,
                    type,
                    action,
                    mediaData
                }),
            });
            if (!res.ok) throw new Error('Update failed');
            return res.json();
        },
        onMutate: async ({ action }) => {
            await queryClient.cancelQueries({ queryKey: ["media-state", mediaId, userId] });
            const previous = queryClient.getQueryData(["media-state", mediaId, userId]);

            queryClient.setQueryData(["media-state", mediaId, userId], (old: any) => ({
                ...old,
                [action]: !old?.[action]
            }));

            return { previous };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(["media-state", mediaId, userId], context?.previous);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["media-state", mediaId, userId] });
        }
    });

    return {
        dbState,
        isLoading,
        toggleAction: (action: string, mediaData: MediaData) =>
            mutation.mutate({ action, mediaData })
    };
}