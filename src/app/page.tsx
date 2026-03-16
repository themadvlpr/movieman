import MainPage from "@/components/MainPage";
// import { tmdbFetch } from "@/lib/tmdb-api";

export default async function Home() {
    // const data = await tmdbFetch("/movie/popular", { page: 1 }, { revalidate: 3600 });

    return (
        <MainPage />
    )
}
