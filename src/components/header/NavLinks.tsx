'use client'

import { LocalizedLink as Link } from '@/components/navigation/Link';
import { usePathname } from 'next/navigation'

import { useTranslation } from '@/providers/LocaleProvider'

const NavLinks = () => {
	const pathname = usePathname()
	const { t } = useTranslation()

	const navItems = [
		{ name: t('nav', 'movies'), href: '/movies' },
		{ name: t('nav', 'tvseries'), href: '/tvseries' },
		{ name: t('nav', 'about'), href: '/about' },
	]

	return (
		<ul className='hidden lg:flex gap-5 font-semibold text-lg items-center'>
			{navItems.map((item) => {
				const isActive = pathname === item.href
				return (
					<li
						key={item.href}
						className={`transition-all duration-500 hover:scale-115 
              ${isActive
								? 'text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
								: 'text-zinc-400 hover:text-amber-50'
							}`}
					>
						<Link href={item.href}>{item.name}</Link>
					</li>
				)
			})}
		</ul>
	)
}

export default NavLinks
