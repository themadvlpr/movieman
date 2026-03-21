'use client'

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { Play, Grid, List, Star, Filter } from "lucide-react"
import LibraryControlsButtons from "@/components/ui/LibraryControlsButtons"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import MoviePoster from "@/components/ui/MoviePoster"

const categories = [
    { key: 'popular', label: 'Popular' },
    { key: 'topRated', label: 'Top Rated' },
]



const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

export default function TvSeriesPage() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [activeCategory, setActiveCategory] = useState<'popular' | 'topRated'>(() => {
        const urlCategory = searchParams.get('category') as any;
        if (['popular', 'topRated'].includes(urlCategory)) return urlCategory;

        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('seriesCategory') as any;
            if (['popular', 'topRated'].includes(saved)) return saved;
        }
        return 'popular'
    })

    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('seriesViewMode') as any;
            if (['grid', 'list'].includes(saved)) return saved;
        }
        return 'grid'
    })

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['series-list', activeCategory],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await fetch(`/api/tv?category=${activeCategory}&page=${pageParam}`)
            if (!response.ok) throw new Error('Network response was not ok')
            const result = await response.json()

            const resultsWithFullPaths = result.results?.map((show: any) => ({
                ...show,
                title: show.name, // Consistency
                poster: show.poster_path ? `${TMDB_IMAGE_BASE}${show.poster_path}` : null,
                release_date: show.first_air_date,
            })) || []

            return {
                ...result,
                results: resultsWithFullPaths
            }
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.total_pages) {
                return lastPage.page + 1
            }
            return undefined
        },
        initialPageParam: 1,
    })

    const tvData = data?.pages.flatMap((page) => page.results) || []

    const [selectedGenre, setSelectedGenre] = useState('All')
    const [selectedYear, setSelectedYear] = useState('All')
    const loaderRef = useRef<HTMLDivElement>(null)

    // Sync state with URL
    useEffect(() => {
        const urlCategory = searchParams.get('category') as any;
        if (urlCategory && ['popular', 'topRated'].includes(urlCategory) && urlCategory !== activeCategory) {
            setActiveCategory(urlCategory);
        }
    }, [searchParams]);

    // Update URL when category changes
    const handleCategoryChange = (key: 'popular' | 'topRated') => {
        setActiveCategory(key);
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', key);
        router.push(pathname + '?' + params.toString(), { scroll: false });
    };

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('seriesCategory', activeCategory)
    }, [activeCategory]);

    useEffect(() => {
        localStorage.setItem('seriesViewMode', viewMode)
    }, [viewMode]);

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


    return (
        <div className="pt-20 min-h-screen">
            <div className="relative z-30 w-full px-4 sm:px-8 md:px-12 pt-2">
                <h1 className="text-3xl sm:text-5xl font-bold mb-5">TV Series: {categories.find((cat: { key: string; label: string; }) => cat.key === activeCategory)?.label}</h1>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-8">
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

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
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
                    </div>
                </div>

                {status === 'pending' ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
                    </div>
                ) : tvData.length > 0 ? (
                    <div className="flex flex-col gap-10">
                        <div
                            key={`${activeCategory}-${viewMode}-${selectedGenre}-${selectedYear}`}
                            className={viewMode === 'grid'
                                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
                                : "flex flex-col gap-3 sm:gap-4"}
                            style={{ animation: 'fadeInUp 0.4s ease-out' }}
                        >
                            {tvData.map((show, idx) => (
                                viewMode === 'grid' ? (
                                    <Link
                                        key={`${show.id}-${idx}`}
                                        href={`/tvseries/${show.id}`}
                                        className="group relative flex flex-col gap-2 sm:gap-3 cursor-pointer"
                                    >
                                        <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-500">
                                            <MoviePoster
                                                src={show.poster}
                                                alt={show.name}
                                                className="group-hover:scale-110 transition-transform duration-700 ease-out"
                                            />
                                            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-6 sm:w-7 h-6 sm:h-7 rounded-lg bg-black/70 backdrop-blur-md flex items-center justify-center text-[10px] sm:text-xs font-bold text-white border border-white/20 z-20">
                                                {idx + 1}
                                            </div>
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 z-20">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 scale-90 group-hover:scale-100 transition-transform duration-300">
                                                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                                                </div>
                                                <div className="scale-90 group-hover:scale-100 transition-transform duration-300 delay-75">
                                                    <LibraryControlsButtons movieId={show.id} size="sm" />
                                                </div>
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                        </div>
                                        <div className="px-0.5 sm:px-1">
                                            <p className="text-white text-xs sm:text-sm font-bold truncate group-hover:text-white transition-colors">
                                                {show.name}
                                            </p>
                                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                                                {show.vote_average !== 0 && (
                                                    <>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                                            <span className="text-white text-[9px] sm:text-[10px] font-bold">
                                                                {show.vote_average.toFixed(1)}
                                                            </span>
                                                        </div>
                                                        <span className="text-zinc-500 text-[9px] sm:text-[10px] font-medium">•</span>
                                                    </>)}
                                                <span className="text-zinc-500 text-[9px] sm:text-[10px] font-medium">
                                                    {show.release_date.split('-').reverse().join('-')}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <Link
                                        key={`${show.id}-${idx}`}
                                        href={`/tvseries/${show.id}`}
                                        className="group flex flex-row gap-3 sm:gap-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/20 transition-all duration-300"
                                    >
                                        <div className="relative w-20 sm:w-32 aspect-2/3 rounded-lg sm:rounded-xl overflow-hidden shrink-0">
                                            <MoviePoster
                                                src={show.poster}
                                                alt={show.name}
                                                className="group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-1.5 left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-black/70 backdrop-blur-md flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white border border-white/20 z-20">
                                                {idx + 1}
                                            </div>
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center gap-2 sm:gap-3 min-w-0">
                                            <div>
                                                <h3 className="text-white text-sm sm:text-xl font-bold group-hover:text-white transition-colors truncate">{show.name}</h3>
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5">
                                                    <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 rounded-md bg-white/10">
                                                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-500 text-yellow-500" />
                                                        <span className="text-white text-[10px] sm:text-xs font-bold">{show.vote_average > 0 ? show.vote_average.toFixed(1) : "N/A"}</span>
                                                    </div>
                                                    <span className="text-zinc-400 text-[10px] sm:text-sm">{show.release_date.split('-').reverse().join('-')}</span>
                                                </div>
                                            </div>
                                            <p className="text-zinc-400 text-xs sm:text-sm line-clamp-1 sm:line-clamp-2 max-w-2xl">
                                                {show.overview}
                                            </p>
                                            <div className="flex items-center gap-4 mt-1 sm:mt-2 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                                <div className="flex items-center gap-2 text-[#46d369] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                                                    Discover
                                                    <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#46d369]" />
                                                </div>
                                                <LibraryControlsButtons movieId={show.id} size="md" />
                                            </div>
                                        </div>
                                    </Link>
                                )
                            ))}
                        </div>

                        <div ref={loaderRef} className="flex justify-center py-10">
                            {hasNextPage ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border-3 border-white/10 border-t-white/30 animate-spin" />
                                    <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Loading...</span>
                                </div>
                            ) : tvData.length > 0 ? (
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
                        <h3 className="text-white text-xl font-bold mb-2">No TV series found</h3>
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
