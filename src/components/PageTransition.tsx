'use client'

import { motion, AnimatePresence, useIsPresent } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode, useContext, useRef } from 'react'
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

/**
 * FrozenRoute preserves the content of the "leaving" route during the exit animation.
 * Without this, Next.js's children prop would update immediately to the new route content,
 * making the exit animation show the "new" page content instead of the "old" one.
 */
function FrozenRoute({ children }: { children: ReactNode }) {
	const context = useContext(LayoutRouterContext)
	const isPresent = useIsPresent()
	const frozen = useRef(context)

	if (isPresent) {
		/* eslint-disable-next-line react-hooks/refs */
		frozen.current = context
	}

	return (
		/* eslint-disable-next-line react-hooks/refs */
		<LayoutRouterContext.Provider value={frozen.current}>
			{children}
		</LayoutRouterContext.Provider>
	)
}

interface PageTransitionProps {
	children: ReactNode
}

const PageTransition = ({ children }: PageTransitionProps) => {
	const pathname = usePathname()

	return (
		<AnimatePresence mode='wait' initial={false}>
			<motion.div
				key={pathname}
				initial={{
					opacity: 0,
					// scale: 0.98,
					x: 200,
					transition: {
						duration: 0.4,
						default: { duration: 0.8 }
					},
				}}
				animate={{
					opacity: 1,
					// scale: 1,
					x: 0,
				}}
				exit={{
					opacity: 0,
					// scale: 0.98,
					x: -200,
					transition: {
						duration: 0.4,
						ease: 'circIn',
						default: { duration: 0.8 }
					},
				}}
				transition={{
					// scale: {
					// 	duration: 0.8,
					// 	ease: [0.22, 1, 0.36, 1],
					// },
					opacity: {
						duration: 0.8,
						ease: 'linear',
					},
					x: {
						duration: 0.8,
						ease: [0.16, 1, 0.3, 1],
					},
				}}
				className='w-full flex-1 flex flex-col'
			>
				<FrozenRoute>{children}</FrozenRoute>
			</motion.div>
		</AnimatePresence>
	)
}

export default PageTransition
