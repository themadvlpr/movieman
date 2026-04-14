import LibraryPage from "@/components/library/LibraryPage";
import { cookies } from 'next/headers';
import { getAuthSession } from "@/lib/auth-sessions";
import { getLibraryAction } from "@/lib/actions/getLibraryAction";
import { getUserListsAction } from "@/lib/actions/userListsActions";
import { dehydrate, HydrationBoundary, QueryClient, DehydratedState } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getLocale } from "@/lib/i18n/get-locale";
import { translations } from "@/lib/i18n/translation";



export async function generateMetadata() {

    const locale = await getLocale();

    const dict = translations[locale] || translations.en;

    return {
        title: `${dict.nav.library} | MovieMan`,
        description: dict.about.metaLibraryDestiption,
    };
}

export default async function Library({ searchParams }: { searchParams: Promise<{ category?: string, type?: string, sort?: string, order?: string, genre?: string, year?: string }> }) {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
        redirect('/');
    }

    const cookieStore = await cookies();
    const viewMode = cookieStore.get('libraryViewMode')?.value || 'grid';

    const locale = await getLocale();

    const queryClient = new QueryClient();

    // page.tsx
    const params = await searchParams;
    const {
        category = 'watched',
        type = 'all',
        sort = 'watchedDate',
        order = 'desc',
        genre = 'all',
        year = 'all'
    } = params;

    const queryKey = ['library-list', category, type, sort, order, locale, genre, year, userId];

    await queryClient.prefetchInfiniteQuery({
        queryKey,
        queryFn: async () => {
            const tmdbLang = locale === 'ru' ? 'ru-RU' : locale === 'ua' ? 'uk-UA' : 'en-US';
            const res = await getLibraryAction(
                userId,
                category,
                type as any,
                sort as any,
                order as any,
                "1",
                tmdbLang,
                genre !== 'all' ? parseInt(genre) : null,
                year !== 'all' ? year : null,
                userId
            );
            return res.success ? res.data : null;
        },
        initialPageParam: 1,
    });

    await queryClient.prefetchQuery({
        queryKey: ['library-user-lists', userId],
        queryFn: async () => {
            const result = await getUserListsAction();
            return result;
        },
    });

    const serverState: DehydratedState = dehydrate(queryClient);

    serverState.queries.forEach((query) => {
        (query.state as { dataUpdatedAt: number }).dataUpdatedAt = 1;
    });

    return (
        <HydrationBoundary state={serverState}>
            <LibraryPage initialViewMode={viewMode as 'grid' | 'list'} userId={userId} sessionUserId={userId} />
        </HydrationBoundary>
    );
}