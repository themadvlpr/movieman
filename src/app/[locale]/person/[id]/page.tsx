import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPersonDetails } from "@/lib/tmdb/getPersonDetails";
import PersonDetail from "@/components/person/PersonDetail";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { PersonDetailProps } from "@/lib/tmdb/types/tmdb-types";
import { getLocale } from "@/lib/i18n/get-locale";
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig";

interface PersonPageProps {
    params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
    const { id, locale } = await params;
    const tmdbLang = TMDB_LANGUAGES[locale as Locale];
    const person = await tmdbFetch(`/person/${id}`, { language: tmdbLang }, CacheConfig.DETAILS);

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
    const { id, locale } = await params
    const tmdbLang = TMDB_LANGUAGES[locale as Locale];
    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['person', id],
        queryFn: () => getPersonDetails(id, tmdbLang),
    })

    const state = dehydrate(queryClient)

    const personData = queryClient.getQueryData<PersonDetailProps>(['person', id])
    if (!personData?.person) {
        notFound()
    }

    return (
        <HydrationBoundary state={state}>
            <PersonDetail personId={id} />
        </HydrationBoundary>
    )
}