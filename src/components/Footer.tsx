'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
    const pathname = usePathname()
    const t = useTranslations()
    const locale = useLocale()

    const isActiveRoute = (route: string) => pathname === `/${locale}` + route || pathname === route

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
              ${isActiveRoute('/') ? 'text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-zinc-400 hover:text-amber-50'}`}><Link href="/">{t('Header.home')}</Link></li>
                    <li className={`transition-all duration-500 hover:scale-115 
              ${isActiveRoute('/movies') ? 'text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-zinc-400 hover:text-amber-50'}`}><Link href="/movies">{t('Header.movies')}</Link></li>
                    <li className={`transition-all duration-500 hover:scale-115 
              ${isActiveRoute('/tvseries') ? 'text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-zinc-400 hover:text-amber-50'}`}><Link href="/tvseries">{t('Header.tvseries')}</Link></li>
                    <li className={`transition-all duration-500 hover:scale-115 
              ${isActiveRoute('/about') ? 'text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-zinc-400 hover:text-amber-50'}`}><Link href="/about">{t('Header.about')}</Link></li>
                </ul>
            </div>
            <div className="w-full max-w-xs h-px my-2 bg-white/10"></div>
            <div className='w-full flex flex-col justify-center items-center text-sm'>
                <p className='text-[8px] text-white/50 mb-5'>{t('Footer.rights')} </p>
                <p>MovieMan {new Date().getFullYear()} ©</p>
            </div>
        </motion.footer>
    )
}