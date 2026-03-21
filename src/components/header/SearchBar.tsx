'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Star, Play, User as UserIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { SearchResponse } from '@/lib/tmdb/types/tmdb-types'
import Link from 'next/link'
import Image from 'next/image'


export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)

	useEffect(() => {
		// Устанавливаем таймер на обновление значения
		const handler = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		// Очищаем таймер, если значение изменилось до истечения задержки
		// Это и есть магия: каждый новый клик по клавише сбрасывает старый таймер
		return () => {
			clearTimeout(handler)
		}
	}, [value, delay])

	return debouncedValue
}

export default function SearchBar() {
	const [isExpanded, setIsExpanded] = useState(false)
	const [searchText, setSearchText] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchText)
		}, 400)
		return () => clearTimeout(timer)
	}, [searchText])

	useEffect(() => {
		if (isExpanded) {
			setSearchText("")
			setDebouncedSearch("")
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'auto'
		}
		return () => {
			document.body.style.overflow = 'auto'
		}
	}, [isExpanded])

	const debouncedQuery = useDebounce(searchText, 500);

	const { data, isLoading } = useQuery({
		queryKey: ['search-movies', debouncedQuery],
		queryFn: async () => {
			if (!debouncedQuery) return { results: [] };
			const res = await fetch(`/api/search?q=${debouncedQuery}`);
			if (!res.ok) throw new Error('Search failed');
			return res.json();
		},
		enabled: debouncedQuery.length > 0,
	});

	const results = data?.results || []

	return (
		<>
			<button
				onClick={() => setIsExpanded(true)}
				className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-white/5 hover:border-white/20 transition-all text-zinc-400 hover:cursor-text hover:scale-115 duration-500'
			>
				<Search size={18} />
				<span className='text-[16px] hidden sm:inline-block sm:max-w-[150px] md:max-w-xs hover:cursor-text truncate whitespace-nowrap font-medium'>
					Search movies, actors, series...
				</span>
			</button>

			{isMounted && createPortal(
				<AnimatePresence>
					{isExpanded && (
						<motion.div
							initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
							animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
							exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
							className='fixed top-0 left-0 w-screen h-dvh z-9999 overflow-y-auto bg-black/80 flex flex-col items-center pt-10 px-4'
							onClick={() => { setIsExpanded(false); setSearchText(''); setDebouncedSearch(''); }}
						>
							<motion.div
								initial={{ y: 20, scale: 0.95 }}
								animate={{ y: 0, scale: 1 }}
								exit={{ y: 20, scale: 0.95 }}
								className='w-full max-w-2xl flex flex-col gap-6'
								onClick={(e) => e.stopPropagation()}
							>
								{/* Search Input Area */}
								<div className='relative flex items-center'>
									<Search
										className='absolute left-4 text-zinc-500'
										size={22}
									/>
									<input
										autoFocus
										type='text'
										placeholder='Search movies, tv series or person...'
										value={searchText}
										className='w-full bg-zinc-900/80 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-xl text-white outline-none focus:border-white/20 shadow-2xl transition-all font-medium placeholder:text-zinc-600'
										onChange={e => setSearchText(e.target.value)}
									/>
									{searchText !== '' && (
										<button
											onClick={() => setSearchText('')}
											className='absolute right-4 text-zinc-500 hover:text-white transition-colors p-1'
										>
											<X size={20} className='cursor-pointer' />
										</button>
									)}
								</div>

								{/* Results Area */}
								<div className='w-full bg-zinc-900/40 border border-white/5 rounded-xl max-h-[80vh] sm:max-h-[60vh] flex flex-col shadow-3xl backdrop-blur-xl'>
									{isLoading && debouncedSearch !== '' ? (
										<div className='p-20 flex flex-col items-center justify-center gap-4 text-zinc-500'>
											<div className='w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin' />
											<span className='font-black uppercase tracking-widest text-[10px]'>Searching database...</span>
										</div>
									) : results.length > 0 ? (
										<div className='overflow-y-auto custom-scrollbar p-6'>
											<div className='grid grid-cols-1 gap-2'>
												{results.map((result: any) => {
													const isPerson = result.media_type === 'person'
													const isMovie = result.media_type === 'movie'
													const isTV = result.media_type === 'tv'

													const title = result.title || result.name
													const imagePath = result.poster_path || result.profile_path
													const date = result.release_date || result.first_air_date
													const year = date?.slice(0, 4)

													const href = isMovie ? `/movies/${result.id}`
														: isTV ? `/tvseries/${result.id}`
															: `/person/${result.id}`

													return (
														<Link
															key={`${result.media_type}-${result.id}`}
															href={href}
															onClick={() => { setIsExpanded(false); setSearchText(''); setDebouncedSearch(''); }}
															className='flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5'
														>
															<div className='relative w-14 aspect-2/3 rounded-lg overflow-hidden bg-zinc-800 shrink-0 shadow-lg'>
																{imagePath ? (
																	<Image
																		src={`https://image.tmdb.org/t/p/w185${imagePath}`}
																		alt={title || ''}
																		fill
																		sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
																		className='object-cover group-hover:scale-110 transition-transform duration-500'
																	/>
																) : (
																	<div className='w-full h-full flex items-center justify-center'>
																		{isPerson ? <UserIcon className='w-6 h-6 text-zinc-700' /> : <Play className='w-6 h-6 text-zinc-700' />}
																	</div>
																)}
															</div>

															<div className='flex-1 flex flex-col gap-1 min-w-0'>
																<div className='flex items-center gap-2'>
																	<span className='text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 text-zinc-500'>
																		{result.media_type}
																	</span>
																	{result.vote_average > 0 && (
																		<div className='flex items-center gap-1'>
																			<Star className='w-3 h-3 fill-amber-500 text-amber-500' />
																			<span className='text-[10px] font-black text-zinc-300'>{result.vote_average.toFixed(1)}</span>
																		</div>
																	)}
																</div>
																<h4 className='text-lg font-bold text-zinc-200 group-hover:text-white transition-colors truncate'>
																	{title}
																</h4>
																{isPerson ? (
																	<span className='text-[11px] font-bold text-zinc-600 uppercase tracking-wider'>
																		{result.known_for_department}
																	</span>
																) : year ? (
																	<span className='text-[11px] font-bold text-zinc-600'>
																		{year}
																	</span>
																) : null}
															</div>

															<div className='w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
																<Play className='w-4 h-4 fill-white ml-0.5' />
															</div>
														</Link>
													)
												})}
											</div>
										</div>
									) : debouncedSearch !== '' ? (
										<div className='p-20 flex flex-col items-center justify-center gap-4 text-zinc-600'>
											<Search size={40} className='opacity-20' />
											<span className='font-black uppercase tracking-widest text-[10px]'>No results found for "{debouncedSearch}"</span>
										</div>
									) : (
										<div className='p-5 sm:p-20 flex flex-col items-center justify-center gap-4 text-zinc-700'>
											<Search size={30} className='opacity-20' />
											<p className='text-sm font-medium'>Search the entire database</p>
											<span className='text-[10px] font-black uppercase tracking-widest opacity-30'>Movies • Series • Actors</span>
										</div>
									)}
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>,
				document.body
			)}
		</>
	)
}
