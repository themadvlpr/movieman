import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPersonDetails } from "@/lib/tmdb/getPersonDetails";
import PersonDetail from "@/components/PersonDetail";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

interface PersonPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
    const { id } = await params;
    const person = await tmdbFetch(`/person/${id}`, {}, CacheConfig.DETAILS);

    if (!person) {
        return {
            title: "Person Not Found | MovieMan",
        };
    }

    return {
        title: `${person.name} | MovieMan`,
        description: person.biography || "No biography available.",
    };
}

export default async function PersonPage({ params }: PersonPageProps) {
    const { id } = await params
    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['person', id],
        queryFn: () => getPersonDetails(id),
    })

    const state = dehydrate(queryClient)

    const personData = queryClient.getQueryData(['person', id]) as any
    if (!personData?.person) {
        notFound()
    }

    return (
        <HydrationBoundary state={state}>
            <PersonDetail personId={id} />
        </HydrationBoundary>
    )
}