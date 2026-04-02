import LibraryPage from "@/components/library/LibraryPage";
import { cookies } from 'next/headers';
import { getAuthSession } from "@/lib/auth-sessions";
import { getLibraryAction } from "@/lib/actions/getLibraryAction";
import { dehydrate, HydrationBoundary, QueryClient, DehydratedState } from "@tanstack/react-query";
import { redirect } from "next/navigation";


export const metadata = {
    title: "My Library | MovieMan",
    description:
        "Your personal library of movies and TV series on MovieMan.",
    openGraph: {
        title: "My Library | MovieMan",
        description: "Your personal library of movies and TV series.",
    },
};


export default async function Library({ searchParams }: { searchParams: Promise<{ category?: string, type?: string, sort?: string, order?: string }> }) {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
        redirect('/');
    }

    const cookieStore = await cookies();
    const viewMode = cookieStore.get('libraryViewMode')?.value || 'grid';

    const params = await searchParams;
    const {
        category = 'watched',
        type = 'all',
        sort = 'watchedDate',
        order = 'desc'
    } = params;

    const queryClient = new QueryClient();

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['library-list', category, type, sort, order],
        queryFn: async () => {
            const res = await getLibraryAction(userId, category as any, type as any, sort as any, order as any, "1");
            return res.success ? res.data : null;
        },
        initialPageParam: 1,
    });

    const serverState: DehydratedState = dehydrate(queryClient);

    serverState.queries.forEach((query) => {
        (query.state as { dataUpdatedAt: number }).dataUpdatedAt = 1;
    });

    return (
        <HydrationBoundary state={serverState}>
            <LibraryPage initialViewMode={viewMode as 'grid' | 'list'} userId={userId} />
        </HydrationBoundary>
    );
}