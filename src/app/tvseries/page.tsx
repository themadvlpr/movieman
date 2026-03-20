import TvSeriesPage from "@/components/tvseries/TvSeriesPage"

export const metadata = {
    title: "TV Series | MovieMan",
    description:
        "Discover the most popular TV series trending right now. Watch trailers and explore cast information on MovieMan.",
    openGraph: {
        title: "TV Series | MovieMan",
        description: "Discover the most popular TV series trending right now.",
    },
};

export default function SeriesPage() {
    return <TvSeriesPage />
}