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
				<ul className='flex justify-center flex-wrap items-center gap-5'>
					<li className={`transition-all duration-500 hover:scale-115 
              ${pathname === '/' ? 'text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-zinc-400 hover:text-amber-50'}`}><Link href="/">{t('nav', 'home')}</Link></li>
					<li className={`transition-all duration-500 hover:scale-115 
              ${pathname === '/movies' ? 'text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-zinc-400 hover:text-amber-50'}`}><Link href="/movies">{t('nav', 'movies')}</Link></li>
					<li className={`transition-all duration-500 hover:scale-115 
              ${pathname === '/tvseries' ? 'text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-zinc-400 hover:text-amber-50'}`}><Link href="/tvseries">{t('nav', 'tvseries')}</Link></li>
					<li className={`transition-all duration-500 hover:scale-115 
              ${pathname === '/about' ? 'text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-zinc-400 hover:text-amber-50'}`}><Link href="/about">{t('nav', 'about')}</Link></li>
				</ul>
			</div>
			<div className="w-full max-w-xs h-px my-2 bg-white/10"></div>
			<div className='w-full flex flex-col justify-center items-center text-sm'>
				<p className='text-[8px] text-white/50 mb-5'>{t('footer', 'rights')} </p>
				<p>MovieMan {new Date().getFullYear()} ©</p>
			</div>
		</motion.footer>
	)
}