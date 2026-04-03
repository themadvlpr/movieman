'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Footer() {
	const pathname = usePathname()
	if (pathname === '/') return null // hide on main page!

	return (
		<motion.footer
			initial={{ opacity: 0, }}
			animate={{ opacity: 1, }}
			transition={{ delay: 2, duration: 0.5 }}
			className='w-full font-semibold flex flex-col justify-center items-center px-2 sm:px-7 pt-5 pb-1 sm:pb-5'
		>
			<div className='w-full'>
				<ul className='flex justify-center items-center gap-5'>
					<li><Link href="/">Home</Link></li>
					<li><Link href="/movies">Movies</Link></li>
					<li><Link href="/tvseries">TV Series</Link></li>
					<li><Link href="/about">About</Link></li>

				</ul>
			</div>
			<div className="w-full max-w-xs h-px my-10 bg-white/10"></div>			<div className='w-full flex justify-center items-center text-sm'>MovieMan {new Date().getFullYear()} © </div>
		</motion.footer>
	)
}


