'use client'

import { useQuery } from '@tanstack/react-query'
import { getMovieDetails } from '@/lib/tmdb/getMovieDetails'
import Loader from '../ui/Loader'
import { MovieDetailProps } from '@/lib/tmdb/types/tmdb-types'
import { dbState } from '@/lib/tmdb/types/db-types'
import { useTranslation } from "@/providers/LocaleProvider";
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig";
import MediaDetailContent from '@/components/movie-tv/MediaDetailContent';

export default function MovieDetail({ movieId, userId }: { movieId: string, userId: string }) {
	const { locale } = useTranslation();
	const tmdbLang = TMDB_LANGUAGES[locale as Locale];

	const { data, isLoading } = useQuery<MovieDetailProps & { initialDbState?: dbState }>({
		queryKey: ['movie', movieId],
		queryFn: () => getMovieDetails(movieId, tmdbLang),
		staleTime: Infinity,
	});

	if (isLoading || !data) return <Loader />;

	return (
		<MediaDetailContent data={data} userId={userId} type="movie" />
	)

}
