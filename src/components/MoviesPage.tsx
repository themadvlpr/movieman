'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { Play, Grid, List, Filter, Calendar, ChevronDown, Star, Check } from "lucide-react"
import FilterDropdown from "@/components/ui/FilterMenu"

const categories = [
    { key: 'popular', label: 'Popular' },
    { key: 'topRated', label: 'Top Rated' },
    { key: 'upcoming', label: 'Upcoming' },
]

const genres = [
    "All", "Action", "Adventure", "Sci-Fi", "Drama", "Thriller", "Horror", "Comedy", "Crime"
]

const years = [
    "All", "2026", "2025", "2024", "2023", "2022", "2021", "2020", "2010s", "2000s"
]

const movies = [
    {
        id: 1,
        title: "Hoopers",
        rating: 7.7,
        release_date: "2026-01-01",
        overview: "Scientists have discovered how to 'hop' human consciousness into lifelike robotic animals, allowing people to communicate with animals as animals. Animal lover Mabel seizes an opportunity to use the technology, uncovering mysteries within the animal world beyond anything she could have imagined.",
        poster: 'https://image.tmdb.org/t/p/original/2RrLuIfIzGWWIH8IAEo6o0IYHmx.jpg',
        logo: 'https://image.tmdb.org/t/p/w500/xS2WPzXYUkW9IZwSL56tV74APPm.png',
        genres: ["Sci-Fi", "Adventure"]
    },
    {
        id: 2,
        title: "Dune: Part Two",
        rating: 8.3,
        release_date: "2024-02-27",
        overview: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
        poster: "https://image.tmdb.org/t/p/original/ylkdrn23p3gQcHx7ukIfuy2CkTE.jpg",
        logo: "https://image.tmdb.org/t/p/w500/woifx7xduIyJYq8ktCiN36zt9Xu.png",
        genres: ["Sci-Fi", "Action"]
    },
    {
        id: 3,
        title: "Oppenheimer",
        rating: 8.1,
        release_date: "2023-07-19",
        overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
        poster: "https://image.tmdb.org/t/p/original/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
        logo: 'https://image.tmdb.org/t/p/w500/b07VisHvZb0WzUpA8VB77wfMXwg.png',
        genres: ["Drama", "History"]
    },
    {
        id: 4,
        title: "Scream 7",
        rating: 5.1,
        release_date: "2026-07-19",
        overview: "Return to Woodsboro as a new Ghostface killer emerges, targeting a new group of friends with a twist that connects to the past.",
        poster: "https://image.tmdb.org/t/p/original/hz7TdCrpLLt2Dz7S3PS2HG9rpAO.jpg",
        logo: 'https://image.tmdb.org/t/p/w500/2JRh8uPqNGlZC72vJawAGHToOnk.png',
        genres: ["Horror", "Thriller"]
    }
]

const categoryMovies: Record<string, typeof movies> = {
    popular: [
        { id: 1, title: "Dune: Part Two", rating: 8.3, release_date: "2024-02-27", overview: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.", poster: "https://image.tmdb.org/t/p/original/ylkdrn23p3gQcHx7ukIfuy2CkTE.jpg", logo: "", genres: ["Sci-Fi", "Action"] },
        { id: 2, title: "Oppenheimer", rating: 8.1, release_date: "2023-07-19", overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.", poster: "https://image.tmdb.org/t/p/original/ptpr0kGAckfQkJeJIt8st5dglvd.jpg", logo: "", genres: ["Drama", "History"] },
        { id: 3, title: "Hoopers", rating: 7.7, release_date: "2026-01-01", overview: "Scientists have discovered how to 'hop' human consciousness into lifelike robotic animals.", poster: "https://image.tmdb.org/t/p/original/2RrLuIfIzGWWIH8IAEo6o0IYHmx.jpg", logo: "", genres: ["Sci-Fi", "Adventure"] },
        { id: 4, title: "Scream 7", rating: 5.1, release_date: "2026-07-19", overview: "A new Ghostface killer emerges, targeting a new group of friends.", poster: "https://image.tmdb.org/t/p/original/hz7TdCrpLLt2Dz7S3PS2HG9rpAO.jpg", logo: "", genres: ["Horror", "Thriller"] },
        { id: 5, title: "Inside Out 2", rating: 8.0, release_date: "2024-06-12", overview: "Teenager Riley's mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions!", poster: "https://image.tmdb.org/t/p/original/vpnVM9B6NMmQpWeZvzLv1oYIqfs.jpg", logo: "", genres: ["Animation", "Comedy"] },
        { id: 6, title: "Godzilla x Kong", rating: 7.2, release_date: "2024-03-27", overview: "Two ancient titans, Godzilla and Kong, clash in an epic battle as humans unravel their intertwined origins.", poster: "https://image.tmdb.org/t/p/original/v48uWVv6mZ9pNiYyqXNve9v694s.jpg", logo: "", genres: ["Action", "Sci-Fi"] },
    ],
    topRated: [
        { id: 1, title: "The Godfather", rating: 8.7, release_date: "1972-03-14", overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.", poster: "https://image.tmdb.org/t/p/original/3bhkrjR8vBqEnmZpLBAb6Lsb0BP.jpg", logo: "", genres: ["Crime", "Drama"] },
        { id: 2, title: "The Shawshank Redemption", rating: 8.7, release_date: "1994-09-22", overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.", poster: "https://image.tmdb.org/t/p/original/9dq7tYOTmCxXmS92sOllUMnI3fs.jpg", logo: "", genres: ["Drama", "Crime"] },
        { id: 3, title: "Schindler's List", rating: 8.6, release_date: "1993-11-30", overview: "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis.", poster: "https://image.tmdb.org/t/p/original/sF1U4EU7SZ4W3IeB6fewe9p6ivI.jpg", logo: "", genres: ["Drama", "History"] },
        { id: 4, title: "Pulp Fiction", rating: 8.5, release_date: "1994-09-10", overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine.", poster: "https://image.tmdb.org/t/p/original/d5iIl9h9mNpmsMCqKP6GgG9Iq1f.jpg", logo: "", genres: ["Crime", "Thriller"] },
        { id: 5, title: "The Dark Knight", rating: 8.5, release_date: "2008-07-16", overview: "Batman raises the stakes in his war on crime as he attempts to dismantle the remaining criminal organizations that plague the streets.", poster: "https://image.tmdb.org/t/p/original/qJ2tW6ixuR7jWXBvH7B5H9aoSvs.jpg", logo: "", genres: ["Action", "Crime", "Drama"] },
        { id: 6, title: "Forrest Gump", rating: 8.5, release_date: "1994-06-23", overview: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man.", poster: "https://image.tmdb.org/t/p/original/arw2vcBveWOVZr6pxY9L3vEWZzT.jpg", logo: "", genres: ["Drama", "Romance"] },
    ],
    upcoming: [
        { id: 1, title: "Thunderbolts*", rating: 0, release_date: "2025-05-02", overview: "A group of anti-heroes is sent on a mission commissioned by the government.", poster: "https://image.tmdb.org/t/p/original/v8id5u0o9R3iWl8y0I5B1M6bXkP.jpg", logo: "", genres: ["Action", "Sci-Fi"] },
        { id: 2, title: "Superman", rating: 0, release_date: "2025-07-11", overview: "Follows the titular superhero as he reconciles his heritage with his human upbringing.", poster: "https://image.tmdb.org/t/p/original/6v2uFvVvSgXToP3o7uXW9k1z9m7.jpg", logo: "", genres: ["Action", "Sci-Fi"] },
        { id: 3, title: "The Fantastic Four", rating: 0, release_date: "2025-07-25", overview: "Reed Richards, Sue Storm, Johnny Storm, and Ben Grimm gain superpowers after being exposed to cosmic rays.", poster: "https://image.tmdb.org/t/p/original/eK4m5L9vM4W8W8W8W8W8W8W8W.jpg", logo: "", genres: ["Action", "Adventure"] },
    ],
}



export default function MoviesPage() {
    const [activeCategory, setActiveCategory] = useState<'popular' | 'topRated' | 'upcoming'>('popular')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedGenre, setSelectedGenre] = useState('All')
    const [selectedYear, setSelectedYear] = useState('All')
    const [isFilterVisible, setIsFilterVisible] = useState(false)

    const filteredMovies = useMemo(() => {
        return categoryMovies[activeCategory].filter(movie => {
            const matchesGenre = selectedGenre === "All" || movie.genres?.includes(selectedGenre);
            const releaseYear = movie.release_date?.slice(0, 4);
            let matchesYear = selectedYear === "All";

            if (selectedYear === "2010s") {
                matchesYear = (Number(releaseYear) >= 2010 && Number(releaseYear) <= 2019);
            } else if (selectedYear === "2000s") {
                matchesYear = (Number(releaseYear) >= 2000 && Number(releaseYear) <= 2009);
            } else if (selectedYear !== "All") {
                matchesYear = releaseYear === selectedYear;
            }

            return matchesGenre && matchesYear;
        });
    }, [activeCategory, selectedGenre, selectedYear]);

    return (
        <div className="pt-20 min-h-screen">
            {/* ─── HEADER & CONTROLS ─── */}
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-2">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-8">
                    {/* Categories */}
                    <div className="flex items-center gap-1 w-full sm:w-fit bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1 overflow-x-auto no-scrollbar">
                        {categories.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setActiveCategory(key as typeof activeCategory)}
                                className={`relative flex-1 sm:flex-none px-2 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap
                                    ${activeCategory === key
                                        ? 'bg-white text-black shadow-lg shadow-white/10'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <span className="relative z-10">{label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        {/* View Toggles */}
                        <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setIsFilterVisible(!isFilterVisible)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 cursor-pointer text-xs sm:text-sm font-medium
                                ${isFilterVisible
                                    ? 'bg-white text-black border-white'
                                    : 'bg-white/5 text-white border-white/10 hover:border-white/30'}`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isFilterVisible ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* ─── FILTERS PANEL ─── */}
                <div className={`transition-all duration-500 ease-in-out ${isFilterVisible ? 'max-h-[800px] mb-10 opacity-100 visible' : 'max-h-0 opacity-0 invisible overflow-hidden'} relative z-40`}>
                    <div className="grid grid-cols-1 w-fit md:grid-cols-2 gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
                        {/* Genre Filter */}
                        <div className="relative group">
                            <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2 block px-1">Genre</label>
                            <FilterDropdown
                                options={genres}
                                selected={selectedGenre}
                                onSelect={setSelectedGenre}
                                icon={<Filter className="w-3.5 h-3.5" />}
                            />
                        </div>

                        {/* Year Filter */}
                        <div className="relative group">
                            <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2 block px-1">Release Year</label>
                            <FilterDropdown
                                options={years}
                                selected={selectedYear}
                                onSelect={setSelectedYear}
                                icon={<Calendar className="w-3.5 h-3.5" />}
                            />
                        </div>
                    </div>
                </div>

                {/* ─── MOVIE CONTENT ─── */}
                {filteredMovies.length > 0 ? (
                    <div
                        key={`${activeCategory}-${viewMode}-${selectedGenre}-${selectedYear}`}
                        className={viewMode === 'grid'
                            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
                            : "flex flex-col gap-3 sm:gap-4"}
                        style={{ animation: 'fadeInUp 0.4s ease-out' }}
                    >
                        {filteredMovies.map((movie, idx) => (
                            viewMode === 'grid' ? (
                                <Link
                                    key={`${movie.id}-${idx}`}
                                    href={`/movie/${movie.title}`}
                                    className="group relative flex flex-col gap-2 sm:gap-3 cursor-pointer"
                                >
                                    <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-500">
                                        <img
                                            src={movie.poster}
                                            alt={movie.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-6 sm:w-7 h-6 sm:h-7 rounded-lg bg-black/70 backdrop-blur-md flex items-center justify-center text-[10px] sm:text-xs font-bold text-white border border-white/20">
                                            {idx + 1}
                                        </div>
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 scale-90 group-hover:scale-100 transition-transform duration-300">
                                                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                                            </div>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                    </div>
                                    <div className="px-0.5 sm:px-1">
                                        <p className="text-white text-xs sm:text-sm font-bold truncate group-hover:text-white transition-colors">
                                            {movie.title}
                                        </p>
                                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                                <span className="text-white text-[9px] sm:text-[10px] font-bold">
                                                    {movie.rating > 0 ? movie.rating.toFixed(1) : "N/A"}
                                                </span>
                                            </div>
                                            <span className="text-zinc-500 text-[9px] sm:text-[10px] font-medium">•</span>
                                            <span className="text-zinc-500 text-[9px] sm:text-[10px] font-medium">
                                                {movie.release_date?.slice(0, 4)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <Link
                                    key={`${movie.id}-${idx}`}
                                    href={`/movie/${movie.title}`}
                                    className="group flex flex-row gap-3 sm:gap-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/20 transition-all duration-300"
                                >
                                    <div className="relative w-20 sm:w-32 aspect-2/3 rounded-lg sm:rounded-xl overflow-hidden shrink-0">
                                        <img
                                            src={movie.poster}
                                            alt={movie.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-1.5 left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-black/70 backdrop-blur-md flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white border border-white/20">
                                            {idx + 1}
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center gap-2 sm:gap-3 min-w-0">
                                        <div>
                                            <h3 className="text-white text-sm sm:text-xl font-bold group-hover:text-white transition-colors truncate">{movie.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5">
                                                <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 rounded-md bg-white/10">
                                                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-500 text-yellow-500" />
                                                    <span className="text-white text-[10px] sm:text-xs font-bold">{movie.rating > 0 ? movie.rating.toFixed(1) : "N/A"}</span>
                                                </div>
                                                <span className="text-zinc-400 text-[10px] sm:text-sm">{movie.release_date?.slice(0, 4)}</span>
                                                <div className="hidden xs:flex gap-1.5 sm:gap-2">
                                                    {movie.genres?.slice(0, 2).map(g => (
                                                        <span key={g} className="text-[8px] sm:text-[10px] uppercase tracking-wider text-zinc-500 font-bold border border-zinc-500/30 px-1 sm:px-1.5 py-0.5 rounded">
                                                            {g}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-zinc-400 text-xs sm:text-sm line-clamp-1 sm:line-clamp-2 max-w-2xl">
                                            {movie.overview}
                                        </p>
                                        <div className="flex items-center gap-2 text-[#46d369] text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-0.5 sm:mt-1 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                            Discover
                                            <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#46d369]" />
                                        </div>
                                    </div>
                                </Link>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                            <Filter className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">No movies found</h3>
                        <p className="text-zinc-500 text-sm max-w-xs">Try adjusting your filters to find what you're looking for.</p>
                        <button
                            onClick={() => { setSelectedGenre('All'); setSelectedYear('All'); }}
                            className="mt-6 text-white text-sm font-semibold underline underline-offset-4 hover:text-zinc-300 cursor-pointer"
                        >
                            Reset filters
                        </button>
                    </div>
                )}
            </div>
            <div className="h-20" />
        </div>
    )
}