'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

interface PageTransitionProps {
	children: ReactNode
}

const PageTransition = ({ children }: PageTransitionProps) => {
	const pathname = usePathname()
	const [isFirstMount, setIsFirstMount] = useState(true)

	useEffect(() => {
		setIsFirstMount(false)
	}, [])

	// Strip locale prefix from pathname for the key to avoid re-triggering animation on language change
	const normalizedPathname = pathname.replace(/^\/(ru|ua|en)(\/|$)/, '/');

	return (
		<motion.div
			key={normalizedPathname}
			initial={isFirstMount ? false : { opacity: 0, y: 20 }}
			animate={{
				opacity: 1,
				y: 0,
			}}
			transition={{
				duration: 0.6,
				ease: 'easeOut',
			}}
			className='w-full flex-1 flex flex-col'
		>
			{children}
		</motion.div>
	)
}



export default PageTransition