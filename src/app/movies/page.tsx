import MoviesPage from "@/components/movies/MoviesPage";
import { cookies } from 'next/headers';
import { getAuthSession } from "@/lib/auth-sessions";
import { getMoviesAction } from "@/lib/tmdb/getMovies";
import { dehydrate, HydrationBoundary, QueryClient, DehydratedState } from "@tanstack/react-query";
import { getLocale } from "@/lib/i18n/get-locale";
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig";
import { Metadata } from "next";
import { translations } from "@/lib/i18n/translation";




// export const metadata = {
//     title: "Movies | MovieMan",
//     description:
//         "Discover the most popular movies trending right now. Watch trailers and explore cast information on MovieMan.",
//     openGraph: {
//         title: "Movies | MovieMan",
//         description: "Discover the most popular movies trending right now.",
//     },
// };

export async function generateMetadata({
    searchParams
}: {
    searchParams: Promise<{ category?: string, genreId?: string }>
}): Promise<Metadata> {
    const { category, genreId } = await searchParams;

    const locale = await getLocale();

    const dict = translations[locale] || translations.en;

    if (!category) {
        return {
            title: `${dict.nav.movies} | MovieMan`,
        };
    }

    let titlePart = "";

    if (category === 'genres' && genreId) {
        titlePart = dict.genres[Number(genreId) as keyof typeof dict.genres]
            || dict.categories.genres;
    }
    else {
        titlePart = dict.categories[category as keyof typeof dict.categories]
            || category;
    }

    return {
        title: `${dict.common.movies}: ${titlePart} | MovieMan`,
        description: dict.about.metaMoviesDestiption,
    };
}


export default async function Movies({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const cookieStore = await cookies();
    const viewMode = cookieStore.get('moviesViewMode')?.value || 'grid';

    const { category = 'popular' } = await searchParams;
    const session = await getAuthSession();
    const userId = session?.user?.id || "";

    const locale = await getLocale();
    const tmdbLang = TMDB_LANGUAGES[locale as Locale];

    const queryClient = new QueryClient();

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['movies-list', category],
        queryFn: async () => {
            const res = await getMoviesAction(category, userId, "1", tmdbLang);
            return res.success ? res.data : null;
        },
        initialPageParam: 1,
    });

    // Set dataUpdatedAt = 1 on all server-prefetched queries.
    // This ensures HydrationBoundary NEVER overwrites an existing client cache
    // (client data fetched at Date.now() >> 1).
    // On the very first visit the client has dataUpdatedAt = 0, so 0 < 1 → server data IS applied.
    const serverState: DehydratedState = dehydrate(queryClient);

    serverState.queries.forEach((query) => {
        (query.state as { dataUpdatedAt: number }).dataUpdatedAt = 1;
    });

    return (
        <HydrationBoundary state={serverState}>
            <MoviesPage initialViewMode={viewMode as 'grid' | 'list'} userId={userId} />
        </HydrationBoundary>
    );
}