'use client'

import { useState, useEffect, useRef } from "react"
import { Play, Grid, List, Filter, Star } from "lucide-react"
import LibraryControlsButtons from "@/components/ui/LibraryControlsButtons"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { updateViewMode } from "@/lib/tmdb/cookies-actions"
import Link from "next/link"

const categories = [
    { key: 'popular', label: 'Popular' },
    { key: 'topRated', label: 'Top Rated' },
    { key: 'upcoming', label: 'Upcoming' },
]

// Image base URL for TMDB
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

import MoviePoster from "@/components/ui/MoviePoster"

interface Props {
    initialViewMode: 'grid' | 'list';
    userId: string;
}

export default function MoviesPage({ initialViewMode, userId }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);

    const [activeCategory, setActiveCategory] = useState<'popular' | 'topRated' | 'upcoming'>(() => {
        const urlCategory = searchParams.get('category') as any;
        if (['popular', 'topRated', 'upcoming'].includes(urlCategory)) return urlCategory;
        return 'popular';
    })


    const toggleView = async (mode: 'grid' | 'list') => {
        const newMode = mode === 'grid' ? 'list' : 'grid'
        setViewMode(newMode)
        await updateViewMode(newMode, 'movies')
    }


    // Sync state with URL if it changes (e.g. back button)
    useEffect(() => {
        const urlCategory = searchParams.get('category') as any;
        if (urlCategory && ['popular', 'topRated', 'upcoming'].includes(urlCategory) && urlCategory !== activeCategory) {
            setActiveCategory(urlCategory);
        }
    }, [searchParams]);

    // Update URL when category changes
    const handleCategoryChange = (key: 'popular' | 'topRated' | 'upcoming') => {
        setActiveCategory(key);
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', key);
        router.push(pathname + '?' + params.toString(), { scroll: false });
    };

    const [selectedGenre, setSelectedGenre] = useState('All')
    const [selectedYear, setSelectedYear] = useState('All')
    const loaderRef = useRef<HTMLDivElement>(null)

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['movies-list', activeCategory],
        queryFn: async ({ pageParam = 1 }) => {
            const timestamp = new Date().getTime(); // Additional cache buster
            const response = await fetch(`/api/movies?category=${activeCategory}&page=${pageParam}&t=${timestamp}`, {
                cache: 'no-store',
                next: { revalidate: 0 }
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();

            const resultsWithFullPaths = result.results?.map((movie: any) => ({
                ...movie,
                poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
            })) || [];

            return {
                ...result,
                results: resultsWithFullPaths
            };
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.total_pages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });

    const moviesData = data?.pages.flatMap((page) => page.results) || [];

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const target = entries[0]
            if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage()
            }
        }, {
            threshold: 0.1,
            rootMargin: '200px'
        })

        if (loaderRef.current) {
            observer.observe(loaderRef.current)
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current)
            }
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    // Persist preferences
    useEffect(() => {
        localStorage.setItem('moviesCategory', activeCategory)
    }, [activeCategory]);

    useEffect(() => {
        localStorage.setItem('moviesViewMode', viewMode)
    }, [viewMode]);


    const handleCardClick = (e: React.MouseEvent, id: string) => {
        const target = e.target as HTMLElement;
        if (target.closest('button')) {
            return;
        }

        router.push(`/movies/${id}`);
    };

    return (
        <div className="pt-20 min-h-screen">
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-2">
                <h1 className="text-3xl sm:text-5xl font-bold mb-5">Movies: {categories.find((cat: { key: string; label: string; }) => cat.key === activeCategory)?.label}</h1>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-8">
                    {/* Categories */}
                    <div className="flex items-center gap-1 w-full sm:w-fit bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1 overflow-x-auto no-scrollbar">
                        {categories.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => handleCategoryChange(key as any)}
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

                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                        {/* View Toggles */}
                        <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1">
                            <button
                                onClick={() => toggleView('list')}
                                className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => toggleView('grid')}
                                className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                    </div>
                </div>



                {/* ─── MOVIE CONTENT ─── */}
                {status === 'pending' ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
                    </div>
                ) : moviesData.length > 0 ? (
                    <div className="flex flex-col gap-10">
                        <div
                            key={`${activeCategory}-${viewMode}-${selectedGenre}-${selectedYear}`}
                            className={viewMode === 'grid'
                                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
                                : "flex flex-col gap-3 sm:gap-4"}
                            style={{ animation: 'fadeInUp 0.4s ease-out' }}
                        >
                            {moviesData.map((movie, idx) => (
                                viewMode === 'grid' ? (
                                    <div className="relative group"
                                        key={`${movie.id}-${idx}`}
                                    >
                                        <Link
                                            key={`${movie.id}-${idx}`}
                                            href={`/movies/${movie.id}`}
                                            className="flex flex-col gap-2 sm:gap-3 cursor-pointer"
                                        >
                                            <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-500">
                                                <MoviePoster
                                                    src={movie.poster}
                                                    alt={movie.title}
                                                    className="group-hover:scale-110 transition-transform duration-700 ease-out"
                                                />

                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 scale-90 group-hover:scale-100 transition-transform duration-300">
                                                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-0.5 sm:px-1">
                                                <p className="text-white text-xs sm:text-sm font-bold truncate transition-colors">
                                                    {movie.title}
                                                </p>
                                            </div>
                                        </Link>

                                        <div className="absolute top-0 inset-0 pointer-events-none z-20 flex flex-col items-center justify-end">
                                            <div className="mb-15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
                                                <LibraryControlsButtons
                                                    mediaId={movie.id}
                                                    mediaData={{
                                                        title: movie.title,
                                                        poster: movie.poster_path,
                                                        rating: movie.vote_average,
                                                        year: movie.release_date
                                                    }}
                                                    type="movie"
                                                    detailPage={false}
                                                    userId={userId}
                                                />
                                            </div>
                                        </div>

                                        <div className="absolute top-2 left-2 w-6 h-6 rounded-lg bg-black/70 backdrop-blur-md flex items-center justify-center text-[10px] font-bold text-white border border-white/20 z-30 pointer-events-none">
                                            {idx + 1}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative group"
                                        key={`${movie.id}-${idx}`}
                                    >
                                        <Link
                                            key={`${movie.id}-${idx}`}
                                            href={`/movies/${movie.id}`}
                                            className="flex flex-row gap-3 sm:gap-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/20 transition-all duration-300"
                                        >
                                            <div className="relative w-20 sm:w-32 aspect-2/3 rounded-lg sm:rounded-xl overflow-hidden shrink-0">
                                                <MoviePoster
                                                    src={movie.poster}
                                                    alt={movie.title}
                                                    className="group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-1.5 left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-black/70 backdrop-blur-md flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white border border-white/20 z-20">
                                                    {idx + 1}
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-center gap-2 sm:gap-3 min-w-0 pr-20"> {/* pr-20 чтобы текст не залезал под кнопки */}
                                                <div>
                                                    <h3 className="text-white text-sm sm:text-xl font-bold transition-colors truncate">{movie.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                                                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-white/10">
                                                            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-500 text-yellow-500" />
                                                            <span className="text-white text-[10px] sm:text-xs font-bold">{movie.vote_average > 0 ? movie.vote_average.toFixed(1) : "N/A"}</span>
                                                        </div>
                                                        <span className="text-zinc-400 text-[10px] sm:text-sm">{movie.release_date?.slice(0, 4)}</span>
                                                    </div>
                                                </div>
                                                <p className="text-zinc-400 text-xs sm:text-sm line-clamp-1 sm:line-clamp-2 max-w-2xl">
                                                    {movie.overview}
                                                </p>

                                                <div className="flex items-center gap-4 mt-2 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                                    <div className="flex items-center gap-2 text-[#414141] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                                                        Discover
                                                        <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#292929]" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>

                                        <div className="absolute bottom-6 right-6 z-30 pointer-events-none translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                            <div className="pointer-events-auto">
                                                <LibraryControlsButtons
                                                    mediaId={movie.id}
                                                    mediaData={{
                                                        title: movie.title,
                                                        poster: movie.poster_path,
                                                        rating: movie.vote_average,
                                                        year: movie.release_date
                                                    }}
                                                    type="movie"
                                                    detailPage={false}
                                                    userId={userId}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Infinite Scroll Sentinel */}
                        <div ref={loaderRef} className="flex justify-center py-10">
                            {hasNextPage ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border-3 border-white/10 border-t-white/30 animate-spin" />
                                    <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Loading...</span>
                                </div>
                            ) : moviesData.length > 0 ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-px w-20 bg-white/10" />
                                    <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">End of list</span>
                                </div>
                            ) : null}
                        </div>
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
        </div>
    )
}