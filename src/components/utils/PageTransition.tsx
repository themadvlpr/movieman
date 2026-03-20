'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionProps {
	children: ReactNode
}

const PageTransition = ({ children }: PageTransitionProps) => {
	const pathname = usePathname()
	return (
		<motion.div
			key={pathname}
			initial={{
				opacity: 0,
				y: 200, // Slide up looks more natural for standard web navigation than horizontal
			}}
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