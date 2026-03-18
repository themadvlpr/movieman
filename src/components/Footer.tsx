'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Footer() {
	const pathname = usePathname()
	if (pathname === '/') return null // hide on main page!

	return (
		<motion.footer
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: 1 }}
			transition={{ delay: 1, duration: 0.5 }}
			className='w-full font-semibold flex justify-center items-center px-2 sm:px-7 pt-5 pb-1 sm:pb-5'
		>
			MovieMan {new Date().getFullYear()}
		</motion.footer>
	)
}


