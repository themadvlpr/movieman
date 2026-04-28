'use client'

import { useQuery } from '@tanstack/react-query'
import { getTVDetails } from '@/lib/tmdb/getTvSeriesDetails'
import { dbState } from '@/lib/tmdb/types/db-types'
import { useTranslation } from "@/providers/LocaleProvider";
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig";
import TvSeriesDetailContent from './TvSeriesDetailContent';
import { TvSeriesDetailProps } from '@/lib/tmdb/types/tmdb-types';
import { Loader2 } from 'lucide-react'



export default function TvSeriesDetail({ tvId, userId }: { tvId: string, userId: string }) {

	const { locale } = useTranslation();
	const tmdbLang = TMDB_LANGUAGES[locale as Locale];


	const { data, isLoading } = useQuery<TvSeriesDetailProps & { initialDbState?: dbState }>({
		queryKey: ['tv', tvId],
		queryFn: () => getTVDetails(tvId, tmdbLang),
		staleTime: Infinity,
	});


	if (isLoading || !data) return <Loader2 />

	return <TvSeriesDetailContent data={data} userId={userId} />
}
