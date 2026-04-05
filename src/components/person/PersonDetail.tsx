'use client'

import { useQuery } from '@tanstack/react-query'
import { getPersonDetails } from '@/lib/tmdb/getPersonDetails'
import { PersonDetailProps } from '@/lib/tmdb/types/tmdb-types'
import Loader from '@/components/ui/Loader'
import PersonDetailContent from '@/components/person/PersonDetailContent'

export default function PersonDetail({ personId }: { personId: string }) {
	const { data, isLoading } = useQuery<PersonDetailProps>({
		queryKey: ['person', personId],
		queryFn: () => getPersonDetails(personId),
		staleTime: 1000 * 60 * 5,
	})

	if (isLoading || !data) return <Loader />

	return <PersonDetailContent data={data} />
}