import LibraryPage from "@/components/library/LibraryPage";
import { cookies } from 'next/headers';
import { getAuthSession } from "@/lib/auth-sessions";
import { getLibraryAction } from "@/lib/actions/getLibraryAction";
import { getUserListsAction } from "@/lib/actions/userListsActions";
import { dehydrate, HydrationBoundary, QueryClient, DehydratedState } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { translations } from "@/lib/i18n/translation";
import { Locale } from "@/lib/i18n/languageconfig";
import { generateCryptoRandomString } from "@/lib/crypt/crypt-utils";



export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;

    const dict = translations[locale] || translations.en;

    return {
        title: `${dict.nav.library} | MovieMan`,
        description: dict.about.metaLibraryDestiption,
    };
}

export default async function Library({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ category?: string, type?: string, sort?: string, order?: string, genre?: string, year?: string }> }) {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
        redirect('/');
    }

    const cookieStore = await cookies();
    const viewMode = cookieStore.get('libraryViewMode')?.value || 'grid';

    const { locale } = await params;

    const queryClient = new QueryClient();

    // page.tsx
    const searchParameters = await searchParams;
    const {
        category = 'watched',
        type = 'all',
        sort = 'watchedDate',
        order = 'desc',
        genre = 'all',
        year = 'all'
    } = searchParameters;

    const isPublic = false;

    const queryKey = ['library-list', category, type, sort, order, locale, genre, year, userId, isPublic];

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

    const encryptedUserId = generateCryptoRandomString(userId);
    return (
        <HydrationBoundary state={serverState}>
            <LibraryPage initialViewMode={viewMode as 'grid' | 'list'} userId={userId} encryptedUserId={encryptedUserId} sessionUserId={userId} />
        </HydrationBoundary>
    );
}