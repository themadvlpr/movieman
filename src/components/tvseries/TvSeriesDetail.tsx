'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Calendar, Play, User, Eye, ChevronRight, List, Info } from 'lucide-react'
import LibraryControlsButtons from '@/components/ui/LibraryControlsButtons'
import { TvSeriesDetailProps } from '@/lib/tmdb/types/tmdb-types'

export default function TvSeriesDetail({ series, credits, similarSeries }: TvSeriesDetailProps) {
	const [isWatched, setIsWatched] = useState(false)
	const [watchDate, setWatchDate] = useState(new Date().toISOString().split('T')[0])
	const [personalRating, setPersonalRating] = useState(5)
	const [note, setNote] = useState('')
	const [isCreatorsExpanded, setIsCreatorsExpanded] = useState(false)
	const [isOverviewExpanded, setIsOverviewExpanded] = useState(false)

	console.log(credits);


	const directors = series.created_by && series.created_by.length > 0
		? series.created_by
		: credits.crew.filter((c: any) => c.jobs ? c.jobs.some((j: any) => j.job === 'Creator' || j.job === 'Executive Producer') : (c.job === 'Creator' || c.job === 'Executive Producer'))


	return (
		<div className='flex-1 relative bg-black text-white min-h-screen'>
			{/* Backdrop Section */}
			<div className='absolute inset-0 h-[35vh] sm:h-[45vh] lg:h-[80vh] w-full overflow-hidden pointer-events-none'>
				<Image
					src={`https://image.tmdb.org/t/p/original${series.backdrop_path}`}
					alt={series.name || 'Backdrop'}
					fill
					sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
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
						<h1 className='text-5xl sm:text-7xl font-bold leading-[0.9] drop-shadow-2xl text-mdnichrome'>{series.name}</h1>

						<div className='flex flex-wrap items-center gap-4 text-sm sm:text-base font-semibold text-zinc-400'>
							<div className='flex items-center gap-1.5 text-zinc-100'>
								<Star className='w-4 h-4 fill-white' />
								<span>{series.vote_average ? series.vote_average.toFixed(1) : 'N/A'}</span>
							</div>
							<span className='text-zinc-800'>|</span>
							<div className='flex items-center gap-1.5 text-zinc-300'>
								<Calendar className='w-4 h-4' />
								<span>
									{series.first_air_date ? series.first_air_date.split('-').reverse().join('-') : 'Unknown'}
									{(series.status === 'Ended' || series.status === 'Canceled') && series.last_air_date ? ` — ${series.last_air_date.split('-').reverse().join('-')}` : ''}
								</span>
							</div>
							<span className='text-zinc-800'>|</span>
							<div className='flex items-center gap-1.5 text-zinc-300'>
								<List className='w-4 h-4' />
								<span>{series.number_of_seasons} Season{series.number_of_seasons !== 1 ? 's' : ''} • {series.number_of_episodes} Episode{series.number_of_episodes !== 1 ? 's' : ''}</span>
							</div>
							<span className='text-zinc-800'>|</span>
							<div className='flex items-center gap-1.5 text-zinc-300'>
								<Info className='w-4 h-4' />
								<span>{series.status}</span>
							</div>
						</div>

						{/* Genres */}
						<div className='flex flex-wrap gap-2'>
							{series.genres?.map((g) => (
								<span key={g.id} className='px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md text-zinc-400'>
									{g.name}
								</span>
							))}
						</div>

						{series.tagline && (
							<p className='text-xl italic text-zinc-500 font-medium'>
								"{series.tagline}"
							</p>
						)}

						<motion.div layout className="max-w-2xl">
							<motion.p
								layout
								className={`text-zinc-300 leading-relaxed text-lg font-medium ${!isOverviewExpanded ? 'line-clamp-4' : ''}`}
							>
								{series.overview}
							</motion.p>
							{series.overview && series.overview.length > 280 && (
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
					<div className='flex flex-wrap items-center gap-6 pt-4'>
						<button
							onClick={() => setIsWatched(!isWatched)}
							className={`flex items-center gap-2.5 px-6 py-2.5 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 cursor-pointer 
								${isWatched ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
						>
							<Eye strokeWidth={3} className={`w-3.5 h-3.5 ${isWatched ? 'fill-black' : ''}`} />
							{isWatched ? 'Watched' : 'Mark as Watched'}
						</button>

						<LibraryControlsButtons movieId={series.id} size="md" hideWatched={true} />
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
						{directors.length > 0 && (() => {
							const uniqueDirectors = directors.filter((d, index, self) => index === self.findIndex((t) => t.id === d.id))
							const displayedDirectors = isCreatorsExpanded ? uniqueDirectors : uniqueDirectors.slice(0, 3)

							return (
								<div>
									<h3 className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4'>Creators / Exec Producers</h3>
									<motion.div layout className='flex flex-col gap-3'>
										<motion.div layout className='flex flex-wrap gap-x-6 gap-y-3'>
											<AnimatePresence mode='popLayout'>
												{displayedDirectors.map((d) => (
													<motion.button
														layout
														initial={{ opacity: 0, scale: 0.9 }}
														animate={{ opacity: 1, scale: 1 }}
														exit={{ opacity: 0, scale: 0.9 }}
														transition={{ duration: 0.2 }}
														key={d.id}
														className='text-xl font-bold hover:text-white transition-colors cursor-pointer text-left text-zinc-300 origin-left'
													>
														{d.name}
													</motion.button>
												))}
											</AnimatePresence>
										</motion.div>
										{uniqueDirectors.length > 3 && (
											<motion.button
												layout
												onClick={() => setIsCreatorsExpanded(!isCreatorsExpanded)}
												className='text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors text-left w-fit mt-1 cursor-pointer'
											>
												{isCreatorsExpanded ? 'Show Less' : `+ ${uniqueDirectors.length - 3} More`}
											</motion.button>
										)}
									</motion.div>
								</div>
							)
						})()}
					</div>
				</div>

				<hr className='border-white/10 my-12' />

				{/* Cast Carousel */}
				<section className='mt-15'>
					<div className='flex justify-between items-end mb-10'>
						<div>
							<h2 className='text-4xl font-bold mb-2'>Top Cast</h2>
							<p className='text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]'>The actors and their roles</p>
						</div>
					</div>
					<div className='flex gap-8 overflow-x-auto pb-10 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0'>
						{credits.cast.map((actor) => (
							<Link key={actor.id} href={`/person/${actor.id}`} className='w-44 shrink-0 group block'>
								<div className='relative aspect-4/5 cursor-pointer rounded-xl overflow-hidden mb-4 bg-zinc-900 ring-1 ring-white/5 group-hover:ring-white/20 transition-all duration-500 shadow-2xl'>
									{actor.profile_path ? (
										<Image
											src={`https://image.tmdb.org/t/p/w342${actor.profile_path}`}
											alt={actor.name}
											fill
											sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
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
								<p className='text-[10px] text-zinc-600 font-bold uppercase tracking-wider truncate mt-1'>
									{(actor as any).roles ? (actor as any).roles[0]?.character : actor.character}
								</p>
							</Link>
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
									placeholder='Write your thoughts about the TV series here...'
									value={note}
									onChange={(e) => setNote(e.target.value)}
									className='w-full bg-transparent text-xl sm:text-2xl font-medium text-zinc-300 outline-none border-none resize-none min-h-[200px] placeholder:text-zinc-800'
								/>
							</div>
						</motion.section>
					)}
				</AnimatePresence>

				{/* Similar Series */}
				<section className='mt-32'>
					<div className='flex justify-between items-end mb-10'>
						<div>
							<h2 className='text-4xl font-bold mb-2'>More Like This</h2>
							<p className='text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]'>Recommendations for you</p>
						</div>
					</div>
					<div className='flex gap-8 overflow-x-auto pb-10 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0'>
						{similarSeries.slice(0, 15).map((m: any) => (
							<Link key={m.id} href={`/tvseries/${m.id}`} className='w-48 shrink-0 group'>
								<div className='relative aspect-2/3 rounded-2xl overflow-hidden mb-4 bg-zinc-900 ring-1 ring-white/5 group-hover:ring-white/20 transition-all duration-500 shadow-2xl'>
									{m.poster_path ? (
										<Image
											src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
											alt={m.name || 'Poster'}
											fill
											sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
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
								<h4 className='font-bold text-base text-zinc-300 group-hover:text-white transition-colors truncate uppercase tracking-tight'>{m.name}</h4>
								<div className='flex items-center gap-3 mt-1.5'>
									<div className='flex items-center gap-1.5'>
										<Star className='w-3 h-3 fill-white text-white' />
										<span className='text-[10px] font-black text-zinc-100'>{m.vote_average ? m.vote_average.toFixed(1) : 'N/A'}</span>
									</div>
									<span className='text-zinc-800 font-bold'>|</span>
									<span className='text-[10px] text-zinc-500 font-black uppercase tracking-widest'>{m.first_air_date?.slice(0, 4) || 'Unknown'}</span>
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
