import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { getAuthSession } from "@/lib/auth-sessions";
import { getDiscoverMovies } from "@/lib/tmdb/getDiscoverMovies";
import MainPage from "@/components/MainPage";
import Loader from '@/components/ui/Loader';


export default async function Home({
    searchParams
}: {
    searchParams: Promise<{ genre?: string }>
}) {
    return (
        <Suspense fallback={<Loader />}>
            <MainContent fetchParams={searchParams} />
        </Suspense>
    );
}

async function MainContent({ fetchParams }: { fetchParams: Promise<{ genre?: string }> }) {
    const [resolvedParams, cookieStore, session] = await Promise.all([
        fetchParams,
        cookies(),
        getAuthSession()
    ]);

    const genreStr = resolvedParams.genre || cookieStore.get('selectedGenreId')?.value || "28";
    const genreId = parseInt(genreStr, 10);
    const userId = session?.user?.id;

    const data = await getDiscoverMovies(genreId.toString(), userId || "");
    const movies = data?.results || [];


    return (
        <MainPage
            movies={movies}
            userId={userId || ""}
            initialGenreId={genreId}
        />
    );
}