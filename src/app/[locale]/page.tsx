import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { getAuthSession } from "@/lib/auth/auth-sessions";
import { getDiscoverMovies } from "@/lib/tmdb/tmdb-requests/getDiscoverMovies";
import MainPage from "@/components/MainPage";
import MainPageSkeleton from "@/components/skeletons/MainPageSkeleton"
import { TMDB_LANGUAGES } from '@/lib/tmdb/tmdb-languages';
import { Locale } from "next-intl"
import { Movie } from "@/lib/tmdb/tmdb-types"

export default async function Home({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ genre?: string }>;
}) {
	return (
		<Suspense fallback={<MainPageSkeleton />}>
			<MainContent params={params} fetchParams={searchParams} />
		</Suspense>
	);
}

async function MainContent({ params, fetchParams }: { params: Promise<{ locale: string }>, fetchParams: Promise<{ genre?: string }> }) {
	const [resolvedParams, resolvedParamsObj, cookieStore, session] = await Promise.all([
		fetchParams,
		params,
		cookies(),
		getAuthSession(),
	]);

	const locale = resolvedParamsObj.locale as Locale;
	const tmdbLang = TMDB_LANGUAGES[locale];

	const genreStr = resolvedParams.genre || cookieStore.get('selectedGenreId')?.value || "28";
	const genreId = parseInt(genreStr, 10);
	const userId = session?.user?.id;

	const data = await getDiscoverMovies(genreId.toString(), userId || "", "1", tmdbLang);
	const movies = data?.results.filter((movie: Movie) =>
		!!movie.backdrop_path
	);

	return (
		<MainPage
			movies={movies}
			userId={userId || ""}
			initialGenreId={genreId}
		/>
	);
}