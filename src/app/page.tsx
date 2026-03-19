import MainPage from "@/components/MainPage"
import { getDiscoverMovies } from "@/lib/tmdb/getDiscoverMovies"
import { cookies } from 'next/headers'

export default async function Home() {

    const cookieStore = await cookies();
    const genre = cookieStore.get('selectedGenreId')?.value || "28";
    const initialData = await getDiscoverMovies(genre);

    return <MainPage initialMovies={initialData.results} />;
}

