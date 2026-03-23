import TvSeriesPage from "@/components/tvseries/TvSeriesPage"
import { cookies } from 'next/headers';
import { getAuthSession } from "@/lib/auth-sessions";

export const metadata = {
    title: "TV Series | MovieMan",
    description:
        "Discover the most popular TV series trending right now. Watch trailers and explore cast information on MovieMan.",
    openGraph: {
        title: "TV Series | MovieMan",
        description: "Discover the most popular TV series trending right now.",
    },
};

export default async function SeriesPage() {
    const cookieStore = await cookies();
    const viewMode = cookieStore.get('tvseriesViewMode')?.value || 'grid';

    const session = await getAuthSession();
    const userId = session?.user?.id;

    return <TvSeriesPage initialViewMode={viewMode as 'grid' | 'list'} userId={userId || ""} />
}