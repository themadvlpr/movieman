import MoviesPage from "@/components/movies/MoviesPage";
import { cookies } from 'next/headers';
import { getAuthSession } from "@/lib/auth-sessions";

export const metadata = {
    title: "Movies | MovieMan",
    description:
        "Discover the most popular movies trending right now. Watch trailers and explore cast information on MovieMan.",
    openGraph: {
        title: "Movies | MovieMan",
        description: "Discover the most popular movies trending right now.",
    },
};

export default async function Movies() {
    const cookieStore = await cookies();
    const viewMode = cookieStore.get('moviesViewMode')?.value || 'grid';

    const session = await getAuthSession();
    const userId = session?.user?.id;

    return (
        <MoviesPage initialViewMode={viewMode as 'grid' | 'list'} userId={userId || ""} />
    );
}
