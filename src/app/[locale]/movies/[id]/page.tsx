import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { getMovieDetails } from "@/lib/tmdb/getMovieDetails";
import MovieDetail from "@/components/movies/MovieDetail";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getAuthSession } from "@/lib/auth-sessions";
import { MovieDetailProps } from "@/lib/tmdb/types/tmdb-types";
import { getUserMediaStatus } from "@/lib/db/getUserMediaStatus";
import { getLocale } from "@/lib/i18n/get-locale";
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig";

interface MoviePageProps {
    params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
    const { id, locale } = await params;
    const tmdbLang = TMDB_LANGUAGES[locale as Locale];
    const movie = await tmdbFetch(`/movie/${id}`, { language: tmdbLang }, CacheConfig.DETAILS);

    if (!movie) {
        return {
            title: "Movie Not Found | MovieMan",
        };
    }

    return {
        title: `${movie.title} | MovieMan`,
        description: movie.overview,
    };
}

export default async function MoviePage({ params }: MoviePageProps) {
    const { id, locale } = await params
    const session = await getAuthSession();
    const userId = session?.user?.id;
    const tmdbLang = TMDB_LANGUAGES[locale as Locale];

    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['movie', id],
        queryFn: async () => {
            const movieData = await getMovieDetails(id, tmdbLang);
            let dbStatus = { isWatched: false, isWishlist: false, isFavorite: false, listIds: [] };

            if (userId) {
                const statuses = await getUserMediaStatus(userId, [Number(id)], "movie");
                if (statuses && statuses[Number(id)]) {
                    dbStatus = statuses[Number(id)];
                }
            }

            return {
                ...movieData,
                initialDbState: dbStatus
            };
        },
    });

    const state = dehydrate(queryClient)

    const movieData = queryClient.getQueryData<MovieDetailProps>(['movie', id])
    if (!movieData?.movie) {
        notFound()
    }

    return (
        <HydrationBoundary state={state}>
            <MovieDetail movieId={id} userId={userId || ""} />
        </HydrationBoundary>
    )
}