'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LocalizedLink as Link } from '@/components/navigation/Link';
import { useTranslation } from '@/providers/LocaleProvider'
import { isActiveRoute } from '@/lib/i18n/url-utils'

export default function Footer() {
	const pathname = usePathname()
	const { t, locale } = useTranslation()

	if (pathname === '/' || pathname === `/${locale}`) return null

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
              ${isActiveRoute(pathname, '/', locale) ? 'text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-zinc-400 hover:text-amber-50'}`}><Link href="/">{t('nav', 'home')}</Link></li>
					<li className={`transition-all duration-500 hover:scale-115 
              ${isActiveRoute(pathname, '/movies', locale) ? 'text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-zinc-400 hover:text-amber-50'}`}><Link href="/movies">{t('nav', 'movies')}</Link></li>
					<li className={`transition-all duration-500 hover:scale-115 
              ${isActiveRoute(pathname, '/tvseries', locale) ? 'text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-zinc-400 hover:text-amber-50'}`}><Link href="/tvseries">{t('nav', 'tvseries')}</Link></li>
					<li className={`transition-all duration-500 hover:scale-115 
              ${isActiveRoute(pathname, '/about', locale) ? 'text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-zinc-400 hover:text-amber-50'}`}><Link href="/about">{t('nav', 'about')}</Link></li>
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