'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/providers/LocaleProvider'
import LanguageSwitcher from './LanguageSwitcher'

const navLinks = [
	{ title: 'movies', href: '/movies' },
	{ title: 'tvseries', href: '/tvseries' },
	{ title: 'about', href: '/about' },

]

export default function MobileMenu() {
	const [isOpen, setIsOpen] = useState(false)
	const [isMounted, setIsMounted] = useState(false)
	const { t } = useTranslation()
	const pathname = usePathname()

	// Handle mounting state for portals
	useEffect(() => {
		setIsMounted(true)
	}, [])

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

			{/* Fullscreen Mobile Menu via Portal */}
			{isMounted && createPortal(
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
							className='fixed top-0 left-0 w-full h-full z-9999 bg-black/80 backdrop-blur-sm overflow-y-auto'
							onClick={() => setIsOpen(false)}
						>
							<div className='min-h-full w-full flex flex-col items-center justify-center py-24 px-4 gap-12'>
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
									{navLinks.map((link, idx) => {
										const isActiveLink = pathname === link.href

										return (
											< motion.li
												key={link.title}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: 20 }}
												transition={{ delay: 0.1 * idx, duration: 0.3 }}
											>
												<Link
													href={link.href}
													onClick={() => setIsOpen(false)}
													className={`text-3xl font-semibold text-zinc-400 hover:text-zinc-100 transition-colors ${isActiveLink ? 'text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`}
												>
													{t('nav', link.title as any)}
												</Link>
											</motion.li>
										)
									})}
								</ul>

								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.4 }}
									className="flex justify-center w-full"
									onClick={(e) => e.stopPropagation()}
								>
									<LanguageSwitcher />
								</motion.div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>,
				document.body
			)}
		</>
	)
}
