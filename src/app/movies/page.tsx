import MoviesPage from "@/components/movies/MoviesPage";


export const metadata = {
    title: "Movies | MovieMan",
    description:
        "Discover the most popular movies trending right now. Watch trailers and explore cast information on MovieMan.",
    openGraph: {
        title: "Movies | MovieMan",
        description: "Discover the most popular movies trending right now.",
    },
};

export default function Movies() {
    return (
        <MoviesPage />
    );
}
