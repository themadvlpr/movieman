import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPersonDetails } from "@/lib/tmdb/getPersonDetails";
import PersonDetail from "@/components/PersonDetail";

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
    const { id } = await params;
    const { person, movieCredits, tvCredits } = await getPersonDetails(id);

    if (!person) {
        notFound();
    }

    return (
        <PersonDetail
            person={person}
            movieCredits={movieCredits}
            tvCredits={tvCredits}
        />
    )
}