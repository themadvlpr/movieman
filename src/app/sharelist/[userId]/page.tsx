import LibraryPage from "@/components/library/LibraryPage";
import { cookies } from 'next/headers';
import { getLibraryAction } from "@/lib/actions/getLibraryAction";
import { dehydrate, HydrationBoundary, QueryClient, DehydratedState } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getLocale } from "@/lib/i18n/get-locale";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-sessions";
import { translations } from "@/lib/i18n/translation";

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const locale = await getLocale();
    const dict = translations[locale] || translations.en;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
    });

    if (!user) return { title: "Not Found", description: "This library does not exist." };

    return {
        title: `${(user.name).split(' ')[0]}: ${(dict.nav.library).split(' ')[1].toLowerCase()} | MovieMan`,
        description: `Explore the movie and TV series library of ${user.name} on MovieMan.`,
        openGraph: {
            title: `${user.name}'s Library | MovieMan`,
            description: `Explore the movie and TV series library of ${user.name} on MovieMan.`,
        },
    };
}

export default async function SharedLibrary({ params, searchParams }: { params: Promise<{ userId: string }>, searchParams: Promise<{ category?: string, type?: string, sort?: string, order?: string, genre?: string, year?: string }> }) {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, image: true }
    });

    if (!user) {
        notFound();
    }

    const cookieStore = await cookies();
    const viewMode = cookieStore.get('libraryViewMode')?.value || 'grid';
    const locale = await getLocale();

    const searchParameters = await searchParams;
    const {
        category = 'watched',
        type = 'all',
        sort = 'watchedDate',
        order = 'desc',
        genre = 'all',
        year = 'all'
    } = searchParameters;

    let sharedListName: string | undefined = undefined;
    if (category.startsWith('list_')) {
        const listId = category.slice(5);
        const list = await prisma.userList.findUnique({
            where: { id: listId, userId }
        });
        if (!list) {
            notFound();
        }
        sharedListName = list.name;
    }

    const queryClient = new QueryClient();
    const session = await getAuthSession();
    const sessionUserId = session?.user?.id;

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['library-list', category, type, sort, order, locale, genre, year, sessionUserId],
        queryFn: async ({ pageParam = 1 }) => {
            const tmdbLang = locale === 'ru' ? 'ru-RU' : locale === 'ua' ? 'uk-UA' : 'en-US';
            const res = await getLibraryAction(
                userId,
                category as any,
                type as any,
                sort as any,
                order as any,
                pageParam.toString(),
                tmdbLang,
                genre !== 'all' ? parseInt(genre) : null,
                year !== 'all' ? year : null,
                sessionUserId
            );
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
            <LibraryPage
                initialViewMode={viewMode as 'grid' | 'list'}
                userId={userId}
                sessionUserId={sessionUserId}
                isPublic={true}
                publicProfile={{ name: user.name, image: user.image, sharedListName }}
            />
        </HydrationBoundary>
    );
}
