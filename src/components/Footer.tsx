'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion' // Добавил AnimatePresence (опционально)
import Link from 'next/link'
import { useTranslation } from '@/providers/LocaleProvider'

export default function Footer() {
	const pathname = usePathname()
	const { t } = useTranslation()

	if (pathname === '/') return null

	return (
		<motion.footer
			key={pathname}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{
				duration: 0.5,
				delay: 1.5
			}}
			className='w-full font-semibold flex flex-col justify-center items-center px-2 sm:px-7 pt-5 pb-1 sm:pb-5'
		>
			<div className='w-full'>
				<ul className='flex justify-center items-center gap-5'>
					<li><Link href="/">{t('nav', 'home')}</Link></li>
					<li><Link href="/movies">{t('nav', 'movies')}</Link></li>
					<li><Link href="/tvseries">{t('nav', 'tvseries')}</Link></li>
					<li><Link href="/about">{t('nav', 'about')}</Link></li>
				</ul>
			</div>
			<div className="w-full max-w-xs h-px my-10 bg-white/10"></div>
			<div className='w-full flex justify-center items-center text-sm'>
				MovieMan {new Date().getFullYear()} © {t('footer', 'rights')}
			</div>
		</motion.footer>
	)
}