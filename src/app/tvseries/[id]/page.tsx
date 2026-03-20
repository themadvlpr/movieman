import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTVDetails } from "@/lib/tmdb/getTvSeriesDetails";
import TvSeriesDetail from "@/components/TvSeriesDetail";

interface TvSeriesPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TvSeriesPageProps): Promise<Metadata> {
    const { id } = await params;
    const series = await tmdbFetch(`/tv/${id}`, {}, CacheConfig.DETAILS);

    if (!series) {
        return {
            title: "TV Series Not Found | MovieMan",
        };
    }

    return {
        title: `${series.name} | MovieMan`,
        description: series.overview,
    };
}

export default async function TvSeriesPage({ params }: TvSeriesPageProps) {
    const { id } = await params;
    const { series, credits, similarSeries } = await getTVDetails(id);

    if (!series) {
        notFound();
    }

    return (
        <TvSeriesDetail
            series={series}
            credits={credits}
            similarSeries={similarSeries}
        />
    )
}