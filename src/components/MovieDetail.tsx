'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Clock, Calendar, Play, User, Eye, ChevronRight } from 'lucide-react'
import LibraryControlsButtons from '@/components/ui/LibraryControlsButtons'
import { MovieDetailProps } from '@/lib/tmdb/types/tmdb-types'


export default function MovieDetail({ movie, credits, similarMovies }: MovieDetailProps) {
	const [isWatched, setIsWatched] = useState(false)
	const [watchDate, setWatchDate] = useState(new Date().toISOString().split('T')[0])
	const [personalRating, setPersonalRating] = useState(5)
	const [note, setNote] = useState('')

	const directors = credits.crew.filter((c) => c.job === 'Director')
	const writers = credits.crew.filter((c) => c.job === 'Writer' || c.job === 'Screenplay')

	const formatRuntime = (minutes: number) => {
		const h = Math.floor(minutes / 60)
		const m = minutes % 60
		return `${h}h ${m}m`
	}

	return (
		<div className='flex-1 relative bg-black text-white min-h-screen'>
			{/* Backdrop Section */}
			<div className='absolute inset-0 h-[75vh] lg:h-screen w-full overflow-hidden pointer-events-none'>
				<Image
					src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
					alt={movie.title}
					fill
					priority
					className='object-cover opacity-40 select-none'
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
							<div className='flex items-center gap-1.5 text-zinc-100'>
								<Star className='w-4 h-4 fill-white' />
								<span>{movie.vote_average.toFixed(1)}</span>
							</div>
							<span className='text-zinc-800'>|</span>
							<div className='flex items-center gap-1.5 text-zinc-300'>
								<Calendar className='w-4 h-4' />
								<span>{movie.release_date.split('-').reverse().join('-')}</span>
							</div>
							<span className='text-zinc-800'>|</span>
							<div className='flex items-center gap-1.5 text-zinc-300'>
								<Clock className='w-4 h-4' />
								<span>{formatRuntime(movie.runtime)}</span>
							</div>
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

						<p className='text-zinc-300 leading-relaxed text-lg max-w-2xl font-medium'>
							{movie.overview}
						</p>
					</motion.div>

					{/* Action Buttons */}
					<div className='flex flex-wrap items-center gap-6 pt-4'>
						<button
							onClick={() => setIsWatched(!isWatched)}
							className={`flex items-center gap-2.5 px-6 py-2.5 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 cursor-pointer 
								${isWatched ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
						>
							<Eye strokeWidth={3} className={`w-3.5 h-3.5 ${isWatched ? 'fill-black' : ''}`} />
							{isWatched ? 'Watched' : 'Mark as Watched'}
						</button>

						<LibraryControlsButtons movieId={movie.id} size="md" hideWatched={true} />
					</div>

					{/* Watched Panel (Date & Rating) */}
					<AnimatePresence mode="wait">
						{isWatched && (
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
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-12 mt-4'>
						<div>
							<h3 className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4'>Directors</h3>
							<div className='flex flex-wrap gap-x-6 gap-y-3'>
								{directors.map((d) => (
									<button key={d.id} className='text-xl font-bold hover:text-white transition-colors cursor-pointer text-left text-zinc-300'>
										{d.name}
									</button>
								))}
							</div>
						</div>
						<div>
							<h3 className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4'>Writers</h3>
							<div className='flex flex-wrap gap-x-6 gap-y-3'>
								{writers.map((w) => (
									<button key={w.id} className='text-xl font-bold hover:text-white transition-colors cursor-pointer text-left text-zinc-300'>
										{w.name}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Cast Carousel */}
				<section className='mt-32'>
					<div className='flex justify-between items-end mb-10'>
						<div>
							<h2 className='text-4xl font-bold mb-2'>Top Cast</h2>
							<p className='text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]'>The actors and their roles</p>
						</div>
					</div>
					<div className='flex gap-8 overflow-x-auto pb-10 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0'>
						{credits.cast.slice(0, 15).map((actor) => (
							<div key={actor.id} className='w-44 shrink-0 group'>
								<div className='relative aspect-4/5 cursor-pointer rounded-xl overflow-hidden mb-4 bg-zinc-900 ring-1 ring-white/5 group-hover:ring-white/20 transition-all duration-500 shadow-2xl'>
									{actor.profile_path ? (
										<Image
											src={`https://image.tmdb.org/t/p/w342${actor.profile_path}`}
											alt={actor.name}
											fill
											className='object-cover cursor-pointer group-hover:scale-105 transition-all duration-700 ease-out'
										/>
									) : (
										<div className='w-full h-full flex items-center justify-center bg-zinc-800'>
											<User className='w-12 h-12 text-zinc-900 fill-zinc-700' />
										</div>
									)}
									<div className='absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60' />
								</div>
								<h4 className='font-bold text-white group-hover:text-white transition-colors truncate'>{actor.name}</h4>
								<p className='text-[10px] text-zinc-600 font-bold uppercase tracking-wider truncate mt-1'>{actor.character}</p>
							</div>
						))}
					</div>
				</section>

				{/* Note Section (Between Cast and Similar) */}
				<AnimatePresence>
					{isWatched && (
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
				<section className='mt-32'>
					<div className='flex justify-between items-end mb-10'>
						<div>
							<h2 className='text-4xl font-bold mb-2'>More Like This</h2>
							<p className='text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]'>Recommendations for you</p>
						</div>
					</div>
					<div className='flex gap-8 overflow-x-auto pb-10 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0'>
						{similarMovies.slice(0, 15).map((m) => (
							<Link key={m.id} href={`/movies/${m.id}`} className='w-48 shrink-0 group'>
								<div className='relative aspect-2/3 rounded-2xl overflow-hidden mb-4 bg-zinc-900 ring-1 ring-white/5 group-hover:ring-white/20 transition-all duration-500 shadow-2xl'>
									{m.poster_path ? (
										<Image
											src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
											alt={m.title}
											fill
											className='object-cover group-hover:scale-110 transition-transform duration-700 ease-out'
										/>
									) : (
										<div className='w-full h-full flex items-center justify-center text-zinc-700 text-[10px] font-bold'>NO POSTER</div>
									)}
									<div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
										<div className='w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20'>
											<Play className='w-6 h-6 fill-white ml-1' />
										</div>
									</div>
								</div>
								<h4 className='font-bold text-base text-zinc-300 group-hover:text-white transition-colors truncate uppercase tracking-tight'>{m.title}</h4>
								<div className='flex items-center gap-3 mt-1.5'>
									<div className='flex items-center gap-1.5'>
										<Star className='w-3 h-3 fill-white text-white' />
										<span className='text-[10px] font-black text-zinc-100'>{m.vote_average.toFixed(1)}</span>
									</div>
									<span className='text-zinc-800 font-bold'>|</span>
									<span className='text-[10px] text-zinc-500 font-black uppercase tracking-widest'>{m.release_date?.slice(0, 4)}</span>
								</div>
							</Link>
						))}
					</div>
				</section>
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
