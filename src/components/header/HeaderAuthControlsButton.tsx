'use client'

import { useEffect, useState } from 'react'
import AuthControlPanel from '../AuthControlPanel'

export default function HeaderAuthControlsButton() {
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		if (!isOpen) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsOpen(false)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		const originalOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
			document.body.style.overflow = originalOverflow
		}
	}, [isOpen])

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className='
        group relative overflow-hidden
        p-2 
        rounded-lg 
        font-medium 
		text-sm
		sm:text-md
		lg:text-lg

        text-zinc-300 
        bg-zinc-900/50 
        border border-white/5 
        backdrop-blur-md
        transition-all duration-300
        hover:text-white
        hover:border-white/20
        hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]
        active:scale-95
		hover: cursor-pointer
    '
			>
				<div className='absolute inset-0 bg-linear-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />

				<span className='relative z-10 flex items-center gap-2'>
					Sign in
					<span className='hidden sm:inline-block opacity-50 group-hover:translate-x-1 transition-transform'>
						→
					</span>
				</span>
			</button>

			{isOpen && (
				<AuthControlPanel handleClose={() => setIsOpen(false)} />
			)}
		</>
	)
}
