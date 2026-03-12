'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Library } from 'lucide-react'
import { useAuthActions } from '@/hooks/use-auth-actions'

interface UserDropdownMenuProps {
	user: {
		name: string | null
		email: string | null
		image?: string | null
	}
}

export default function UserDropdownMenu({ user }: UserDropdownMenuProps) {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const { signOut, loadingType } = useAuthActions()

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	// Close dropdown on escape key
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('keydown', handleEscape)
		}
		return () => {
			document.removeEventListener('keydown', handleEscape)
		}
	}, [isOpen])



	return (
		<div className='relative ml-2 sm:ml-4' ref={dropdownRef}>
			{/* Avatar Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='flex items-center gap-2 cursor-pointer hover:opacity-90 rounded-full focus:outline-none transition-all active:scale-95 group'
				aria-expanded={isOpen}
				aria-haspopup='true'
			>
				<div className='relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors bg-zinc-800 flex items-center justify-center shrink-0'>
					{user.image ? (
						<img
							src={user.image || '/user.png'}
							alt={user.name || 'User avatar'}
							className='w-full h-full object-cover'
						/>
					) : (
						<span className='text-zinc-400 font-medium text-sm sm:text-base uppercase'>
							{user.name ? user.name.charAt(0) : user.email?.charAt(0) || 'U'}
						</span>
					)}
				</div>

			</button>

			{/* Dropdown Menu */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 10, scale: 0.95 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
						className='absolute right-0 top-full mt-2 w-56 rounded-xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-100'
					>
						{/* User Info Header */}
						<div className='px-4 py-3 border-b border-white/5 bg-black/20'>
							<p className='text-sm font-medium text-zinc-200 truncate'>
								{user.name || 'User'}
							</p>
							<p className='text-xs text-zinc-500 truncate'>
								{user.email || ''}
							</p>
						</div>

						{/* Menu Items */}
						<div className='p-1.5 flex flex-col'>
							<Link
								href='/library'
								onClick={() => setIsOpen(false)}
								className='flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors group'
							>
								<Library className='w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors' />
								My library
							</Link>

							<div className='h-px bg-white/5 my-1 mx-1' />

							<button
								onClick={signOut}
								disabled={loadingType === 'logout'}
								className='flex items-center gap-3 px-3 py-2.5 text-sm w-full text-left text-red-500/80 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors group'
							>
								<LogOut className='w-4 h-4 text-red-500/60 group-hover:text-red-400 transition-colors' />
								Log out
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
