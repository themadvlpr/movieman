'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'

export default function SearchBar() {
	const [isExpanded, setIsExpanded] = useState(false)
	const [searchText, setSearchText] = useState('')

	useEffect(() => {
		setSearchText("")

		if (isExpanded) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'auto'
		}
		return () => {
			document.body.style.overflow = 'auto'
		}
	}, [isExpanded])
	return (
		<>
			<button
				onClick={() => setIsExpanded(true)}
				className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-white/5 hover:border-white/20 transition-all text-zinc-400 hover:cursor-text'
			>
				<Search size={18} />
				<span className='text-[16px] hidden sm:inline-block sm:max-w-[150px] md:max-w-xs hover:cursor-text truncate whitespace-nowrap'>
					Search movies, actors, series...
				</span>
			</button>

			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
						animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
						exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
						className='fixed inset-0 z-999 bg-black/80 flex flex-col items-center pt-5 px-4'
						onClick={() => setIsExpanded(false)}
					>
						<motion.div
							initial={{ y: 20, scale: 0.95 }}
							animate={{ y: 0, scale: 1 }}
							exit={{ y: 20, scale: 0.95 }}
							className='w-full max-w-2xl relative flex items-center'
							onClick={(e) => e.stopPropagation()}
						>
							<Search
								className='absolute left-3 top-3 text-zinc-500'
								size={20}
							/>
							<input
								autoFocus
								type='text'
								placeholder='Search movies, tv series or person...'
								value={searchText}
								className='w-full bg-zinc-900/60 border border-white/10 rounded-lg py-2 pl-10 pr-10 text-lg text-white outline-none focus:border-white/20 shadow-2xl transition-all'
								onChange={e => setSearchText(e.target.value)}
							/>
							{searchText !== '' && (
								<button
									onClick={() => setSearchText('')}
									className='absolute right-3 top-3.5 text-zinc-500 hover:text-white transition-colors'
								>
									<X size={20} className='cursor-pointer' />
								</button>
							)}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	)
}
