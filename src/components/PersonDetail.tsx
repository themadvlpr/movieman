'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, MapPin, Calendar, Play, User } from 'lucide-react'
import { PersonDetailProps } from '@/lib/tmdb/types/tmdb-types'
import { getPersonDetails } from '@/lib/tmdb/getPersonDetails'
import { useQuery } from '@tanstack/react-query'
import Loader from '@/components/ui/Loader'
import DetailCarousel from './ui/DetailCarousel'

export default function MovieDetail({ personId }: { personId: string }) {

	const { data } = useQuery<PersonDetailProps>({
		queryKey: ['person', personId],
		queryFn: () => getPersonDetails(personId),
	})

	if (!data) return <Loader />

	const { person, movieCredits, tvCredits } = data

	const [isOverviewExpanded, setIsOverviewExpanded] = useState(false)

	const mergeCredits = (credits: any[]) => {
		const merged: Record<string, any> = {}
		credits.forEach((item) => {
			const id = item.id.toString()
			if (!merged[id]) {
				merged[id] = { ...item }
				if (item.character) merged[id].characters = [item.character]
				if (item.job) merged[id].jobs = [item.job]
			} else {
				if (item.character && !merged[id].characters?.includes(item.character)) {
					merged[id].characters = [...(merged[id].characters || []), item.character]
				}
				if (item.job && !merged[id].jobs?.includes(item.job)) {
					merged[id].jobs = [...(merged[id].jobs || []), item.job]
				}
			}
		})
		return Object.values(merged).map((item) => ({
			...item,
			character: item.characters?.join(' / ') || item.character,
			job: item.jobs?.join(' / ') || item.job
		}))
	}

	// Combine and sort best movies (cast or crew depending on volume)
	const isActor = person.known_for_department === 'Acting'
	const movieWorks = isActor ? mergeCredits(movieCredits.cast) : mergeCredits(movieCredits.crew.filter(c => c.department === person.known_for_department))
	const bestMovies = [...movieWorks].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0)).slice(0, 15)

	const tvWorks = isActor ? mergeCredits(tvCredits.cast) : mergeCredits(tvCredits.crew.filter(c => c.department === person.known_for_department))
	const bestTv = [...tvWorks].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0)).slice(0, 15)

	return (
		<div className='flex-1 relative bg-black text-white min-h-screen'>
			{/* Backdrop Section (Blurred Profile Image) */}
			{person.profile_path && (
				<div className='absolute inset-0 h-[35vh] sm:h-[45vh] lg:h-[80vh] w-full overflow-hidden pointer-events-none'>
					<Image
						src={`https://image.tmdb.org/t/p/original${person.profile_path}`}
						alt={person.name}
						fill
						sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
						priority
						className='object-cover opacity-20 blur-3xl scale-110 select-none'
					/>
					<div className='absolute inset-0 bg-linear-to-t from-black via-black/60 to-black/20 lg:from-black lg:via-[#010101]/80' />
					<div className='absolute inset-0 bg-linear-to-r from-black via-transparent to-transparent lg:from-black/90' />
				</div>
			)}

			{/* Main Content Area */}
			<div className='relative z-10 pt-32 pb-20 px-4 sm:px-8 md:px-12 lg:px-20'>
				<div className='flex flex-col lg:flex-row gap-10 lg:gap-16'>

					{/* Profile Poster */}
					<div className='w-48 sm:w-64 lg:w-80 shrink-0 mx-auto lg:mx-0'>
						<div className='relative aspect-2/3 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10'>
							{person.profile_path ? (
								<Image
									src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
									alt={person.name}
									fill
									sizes='(max-width: 768px) 100vw, 320px'
									priority
									className='object-cover'
								/>
							) : (
								<div className='w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600'>
									<User className='w-20 h-20 mb-4' />
									<span className='font-bold text-sm'>No Photo</span>
								</div>
							)}
						</div>
					</div>

					{/* Profile Info */}
					<div className='flex-1 flex flex-col gap-8 lg:pt-8'>
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							className='space-y-6'
						>
							<h1 className='text-5xl sm:text-7xl font-bold leading-[0.9] drop-shadow-2xl text-mdnichrome text-center lg:text-left'>
								{person.name}
							</h1>

							<div className='flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm sm:text-base font-semibold text-zinc-400'>
								<div className='flex items-center gap-1.5 text-zinc-100'>
									<User className='w-4 h-4' />
									<span>{person.known_for_department}</span>
								</div>

								{person.birthday && (
									<>
										<span className='text-zinc-800'>|</span>
										<div className='flex items-center gap-1.5 text-zinc-300'>
											<Calendar className='w-4 h-4' />
											<span>
												{person.birthday.split('-').reverse().join('-')}
												{person.deathday && ` — ${person.deathday.split('-').reverse().join('-')}`}
											</span>
										</div>
									</>
								)}

								{person.place_of_birth && (
									<>
										<span className='text-zinc-800'>|</span>
										<div className='flex items-center gap-1.5 text-zinc-300'>
											<MapPin className='w-4 h-4' />
											<span>{person.place_of_birth}</span>
										</div>
									</>
								)}
							</div>

							{/* Biography */}
							{person.biography && (
								<motion.div layout className="max-w-3xl mx-auto lg:mx-0 pt-4">
									<h3 className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-3'>Biography</h3>
									<motion.p
										layout
										className={`text-zinc-300 leading-relaxed text-base sm:text-lg font-medium whitespace-pre-wrap ${!isOverviewExpanded ? 'line-clamp-4' : ''}`}
									>
										{person.biography}
									</motion.p>
									{person.biography.length > 280 && (
										<motion.button
											layout
											onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
											className='text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors text-left w-fit mt-3 cursor-pointer'
										>
											{isOverviewExpanded ? 'Show Less' : 'Read More'}
										</motion.button>
									)}
								</motion.div>
							)}
						</motion.div>
					</div>
				</div>

				<hr className='border-white/10 my-20' />

				{/* Best Movies */}
				<DetailCarousel type='person-credits' items={bestMovies} mediaType='movie' />

				{/* Best TV Series */}
				<DetailCarousel type='person-credits' items={bestTv} mediaType='tv' />

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
