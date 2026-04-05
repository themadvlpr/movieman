'use client'

import Loader from '@/components/ui/Loader'
import { useQuery } from '@tanstack/react-query'
import { getTVDetails } from '@/lib/tmdb/getTvSeriesDetails'
import { dbState } from '@/lib/tmdb/types/db-types'
import { useTranslation } from "@/providers/LocaleProvider";
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig";
import TvSeriesDetailContent from './TvSeriesDetailContent';
import { TvSeriesDetailProps } from '@/lib/tmdb/types/tmdb-types';



export default function TvSeriesDetail({ tvId, userId }: { tvId: string, userId: string }) {

	const { locale } = useTranslation();
	const tmdbLang = TMDB_LANGUAGES[locale as Locale];


	const { data } = useQuery<TvSeriesDetailProps & { initialDbState?: dbState }>({
		queryKey: ['tv', tvId],
		queryFn: () => getTVDetails(tvId, tmdbLang),
		staleTime: Infinity,
	});


	if (!data) return <Loader />

	return <TvSeriesDetailContent data={data} userId={userId} />
}
