'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const navLinks = [
	{ title: 'Movies', href: '/movies' },
	{ title: 'TV Series', href: '/tvseries' },
	{ title: 'About', href: '/about' },

]

export default function MobileMenu() {
	const [isOpen, setIsOpen] = useState(false)

	// Prevent scrolling when menu is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'auto'
		}
		return () => {
			document.body.style.overflow = 'auto'
		}
	}, [isOpen])

	return (
		<>
			{/* Burger Button */}
			<button
				onClick={() => setIsOpen(true)}
				className='text-zinc-400 hover:text-zinc-100 transition-colors p-2 cursor-pointer'
				aria-label='Open Menu'
			>
				<Menu className='w-7 h-7' />
			</button>

			{/* Fullscreen Mobile Menu */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className='fixed inset-0 z-100 bg-black/80 backdrop-blur-sm overflow-y-auto'
						onClick={() => setIsOpen(false)}
					>
						<div className='min-h-full flex flex-col items-center justify-center py-24 px-4'>
							{/* Close Button */}
							<button
								onClick={() => setIsOpen(false)}
								className='fixed cursor-pointer top-2 right-2 sm:right-7 sm:top-5 text-zinc-400 hover:text-zinc-100 transition-colors p-2 z-50'
								aria-label='Close Menu'
							>
								<X className='w-8 h-8' />
							</button>

							{/* Navigation Links */}
							<ul className='flex flex-col items-center gap-8'>
								{navLinks.map((link, idx) => (
									<motion.li
										key={link.title}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 20 }}
										transition={{ delay: 0.1 * idx, duration: 0.3 }}
									>
										<Link
											href={link.href}
											onClick={() => setIsOpen(false)}
											className='text-3xl font-semibold text-zinc-400 hover:text-zinc-100 transition-colors'
										>
											{link.title}
										</Link>
									</motion.li>
								))}
							</ul>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	)
}
