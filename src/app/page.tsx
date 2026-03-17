import MainPage from "@/components/MainPage"
import { getDiscoverMovies } from "@/lib/tmdb/getDiscoverMovies";

export default async function Home() {
    const genres = [
        28, 12, 16, 35, 80, 18, 27, 878, 53
    ]


    const genre = "28";
    const initialData = await getDiscoverMovies(genre);

    return <MainPage initialMovies={initialData.results} />;
}

