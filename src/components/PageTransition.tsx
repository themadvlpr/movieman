'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionProps {
	children: ReactNode
}

const PageTransition = ({ children }: PageTransitionProps) => {
	const pathname = usePathname()

	return (
		<AnimatePresence mode='wait'>
			<motion.div
				key={pathname}
				initial={{
					opacity: 0,
					scale: 0.5,
					filter: 'blur(20px)',
					x: 30,
				}}
				animate={{
					opacity: 1,
					scale: 1,
					filter: 'blur(0px)',
					x: 0,
				}}
				exit={{
					opacity: 0,
					scale: 0.9,
					filter: 'blur(10px)',
					x: -10,
					transition: { duration: 0.3, ease: 'easeInOut' },
				}}
				transition={{
					// Step 1: Fast scale up
					scale: {
						duration: 0.4,
						ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for snappy feel
					},
					// Step 2: Smoothly fade in and remove blur as it scales
					opacity: {
						duration: 0.6,
						ease: 'linear',
						delay: 0.05,
					},
					filter: {
						duration: 0.6,
						ease: 'easeOut',
						delay: 0.1,
					},
					// Step 3: Finalize horizontal position
					x: {
						duration: 0.5,
						ease: 'easeOut',
						delay: 0.15,
					},
				}}
				className='w-full flex-1 flex flex-col'
			>
				{children}
			</motion.div>
		</AnimatePresence>
	)
}

export default PageTransition
