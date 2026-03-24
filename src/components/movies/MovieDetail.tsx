'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Clock, Calendar, ChevronRight, Globe } from 'lucide-react'
import LibraryControlsButtons from '@/components/ui/LibraryControlsButtons'
import { useQuery } from '@tanstack/react-query'
import { getMovieDetails } from '@/lib/tmdb/getMovieDetails'
import Loader from '../ui/Loader'
import { MovieDetailProps } from '@/lib/tmdb/types/tmdb-types'
import DetailCarousel from '../ui/DetailCarousel'
import { useMediaActions } from '@/hooks/useDBMediaStates'


export default function MovieDetail({ movieId, userId }: { movieId: string, userId: string }) {
	const [imageLoading, setImageLoading] = useState(true);

	const { data } = useQuery<MovieDetailProps>({
		queryKey: ['movie', movieId],
		queryFn: () => getMovieDetails(movieId),
	})



	const { dbState } = useMediaActions(Number(movieId), userId, "movie");

	if (!data) return <Loader />

	const { movie, credits, similarMovies } = data

	const [watchDate, setWatchDate] = useState(new Date().toISOString().split('T')[0])
	const [personalRating, setPersonalRating] = useState(5)
	const [note, setNote] = useState('')
	const [isOverviewExpanded, setIsOverviewExpanded] = useState(false)

	const mainCrewMap: Record<number, { name: string, jobs: string[], id: number }> = {}
	credits.crew.forEach(c => {
		if (c.job === 'Director' || c.job === 'Writer' || c.job === 'Screenplay') {
			if (!mainCrewMap[c.id]) {
				mainCrewMap[c.id] = { id: c.id, name: c.name, jobs: [c.job] }
			} else if (!mainCrewMap[c.id].jobs.includes(c.job)) {
				mainCrewMap[c.id].jobs.push(c.job)
			}
		}
	})
	const mainCrew = Object.values(mainCrewMap)

	const formatRuntime = (minutes: number) => {
		const h = Math.floor(minutes / 60)
		const m = minutes % 60
		return `${h}h ${m}m`
	}

	return (
		<div className='flex-1 relative bg-black text-white min-h-screen'>
			<div className='absolute inset-0 h-[35vh] sm:h-[45vh] lg:h-screen w-full overflow-hidden pointer-events-none'>
				{/* Backdrop Section */}
				<AnimatePresence>
					{imageLoading && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 bg-zinc-900/90 overflow-hidden"
						>
							<div className="absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
							<div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
								<div className="relative">
									<div className="w-14 h-14 rounded-full border-4 border-white/10 border-t-white/90 animate-spin shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
									<div className="absolute inset-0 blur-lg bg-white/5 rounded-full" />
								</div>
								<span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 animate-pulse">
									Loading Poster
								</span>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
				<Image
					src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
					alt={movie.title}
					fill
					sizes='100vw'
					priority
					className='object-cover opacity-40 select-none'
					onLoad={() => setImageLoading(false)}

				/>
				<div className='absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/20 lg:from-[#010101]' />
				<div className='absolute inset-0 bg-linear-to-r from-black via-transparent to-transparent lg:from-black/80' />
			</div>

			{/* Main Content Area */}
			<div className='relative z-10 pt-40 pb-20 px-4 sm:px-8 md:px-12 lg:px-20'>
				<div className='max-w-3xl flex flex-col gap-8'>
					{/* Basic Info */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className='space-y-6'
					>
						<h1 className='text-5xl sm:text-7xl font-bold leading-[0.9] drop-shadow-2xl text-mdnichrome'>{movie.title}</h1>

						<div className='flex flex-wrap items-center gap-4 text-sm sm:text-base font-semibold text-zinc-400'>
							{movie.vote_average !== 0 && (
								<>
									<div className='flex items-center gap-1.5 text-zinc-100'>
										<Star className='w-4 h-4 fill-amber-400 text-amber-400' />
										<span>{movie.vote_average.toFixed(1)}</span>
									</div>
									<span className='text-zinc-800'>|</span>
								</>
							)}
							<div className='flex items-center gap-1.5 text-zinc-300'>
								<Calendar className='w-4 h-4' />
								<span>{movie.release_date.split('-').reverse().join('-')}</span>
							</div>
							{movie.production_countries && movie.production_countries.length > 0 && (
								<>
									<span className='text-zinc-800'>|</span>
									<div className='flex items-center gap-1.5 text-zinc-300'>
										<Globe className='w-4 h-4' />
										<span>{movie.production_countries.map(c => c.iso_3166_1).join(', ')}</span>
									</div>
								</>
							)}
							{movie.runtime !== 0 && (
								<>
									<span className='text-zinc-800'>|</span>
									<div className='flex items-center gap-1.5 text-zinc-300'>
										<Clock className='w-4 h-4' />
										<span>{formatRuntime(movie.runtime)}</span>
									</div>
								</>
							)}
						</div>

						{/* Genres */}
						<div className='flex flex-wrap gap-2'>
							{movie.genres.map((g) => (
								<span key={g.id} className='px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md text-zinc-400'>
									{g.name}
								</span>
							))}
						</div>

						{movie.tagline && (
							<p className='text-xl italic text-zinc-500 font-medium'>
								"{movie.tagline}"
							</p>
						)}

						<motion.div layout className="max-w-2xl">
							<motion.p
								layout
								className={`text-zinc-300 leading-relaxed text-lg font-medium ${!isOverviewExpanded ? 'line-clamp-4' : ''}`}
							>
								{movie.overview}
							</motion.p>
							{movie.overview && movie.overview.length > 280 && (
								<motion.button
									layout
									onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
									className='text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors text-left w-fit mt-2 cursor-pointer'
								>
									{isOverviewExpanded ? 'Show Less' : 'Read More'}
								</motion.button>
							)}
						</motion.div>
					</motion.div>

					{/* Action Buttons */}


					<LibraryControlsButtons
						mediaId={movie.id}
						mediaData={{
							title: movie.title,
							poster: movie.poster_path,
							rating: movie.vote_average,
							year: movie.release_date
						}}
						type="movie"
						userId={userId}
					/>

					{/* Watched Panel (Date & Rating) */}
					<AnimatePresence mode="wait">
						{dbState?.isWatched && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 10 }}
								className='bg-zinc-900/10 backdrop-blur-xl border border-white/5 rounded-xl p-3.5 shadow-2xl space-y-4 max-w-[220px]'
							>
								<div className='flex justify-between'>
									<div className='flex flex-col gap-1'>
										<label className='text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700'>Watched on</label>
										<input
											type='date'
											value={watchDate}
											onChange={(e) => setWatchDate(e.target.value)}
											className='w-fit bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-white/20 transition-colors text-white text-[11px] font-bold cursor-pointer'
										/>
									</div>

									<div className='flex flex-col gap-1'>
										<label className='text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700'>Rating</label>
										<div className='relative w-fit'>
											<select
												value={personalRating}
												onChange={(e) => setPersonalRating(parseInt(e.target.value))}
												className='w-fit bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-white/20 transition-colors text-white text-[11px] font-bold appearance-none cursor-pointer pr-8'
											>
												{[...Array(10)].map((_, i) => (
													<option key={i + 1} value={i + 1} className='bg-zinc-950 text-white'>
														{i + 1}
													</option>
												))}
											</select>
											<div className='absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600'>
												<ChevronRight className='w-3 h-3 rotate-90' />
											</div>
										</div>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Credits Summary */}
					{/* Credits Summary */}
					{mainCrew.length > 0 && (
						<div className='mt-4'>
							<h3 className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6'>Main Crew</h3>
							<div className='flex flex-wrap gap-x-12 gap-y-6'>
								{mainCrew.map((person) => (
									<div key={person.id} className='flex flex-col gap-1'>
										<Link href={`/person/${person.id}`} className='text-xl sm:text-2xl font-bold hover:text-white transition-colors cursor-pointer text-left text-zinc-300'>
											{person.name}
										</Link>
										<span className='text-[10px] font-black uppercase tracking-widest text-zinc-600'>
											{person.jobs.join(' / ')}
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				<hr className='border-white/10 my-12' />

				{/* Cast Carousel */}
				<DetailCarousel type='cast' items={credits.cast} mediaType='movie' />

				{/* Note Section (Between Cast and Similar) */}
				<AnimatePresence>
					{dbState?.isWatched && (
						<motion.section
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 20 }}
							className='mt-20 max-w-4xl'
						>
							<div className='bg-white/2 border border-white/5 rounded-3xl p-8 sm:p-10 shadow-3xl'>
								<label className='text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-6 block'>Your Personal Notes</label>
								<textarea
									placeholder='Write your thoughts about the movie here...'
									value={note}
									onChange={(e) => setNote(e.target.value)}
									className='w-full bg-transparent text-xl sm:text-2xl font-medium text-zinc-300 outline-none border-none resize-none min-h-[200px] placeholder:text-zinc-800'
								/>
							</div>
						</motion.section>
					)}
				</AnimatePresence>

				{/* Similar Movies */}
				<DetailCarousel type='similar' items={similarMovies} mediaType='movie' />
			</div>

			<style jsx>{`
				.text-mdnichrome {
					font-family: var(--font-nichrome), serif;
				}
				@font-face {
					font-family: 'MD Nichrome';
					src: url('/fonts/MDNichrome-Bold.woff2') format('woff2');
					font-weight: bold;
					font-style: normal;
				}
			`}</style>
		</div>
	)
}
