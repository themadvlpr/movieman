'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NavLinks = () => {
	const pathname = usePathname()

	const navItems = [
		{ name: 'Movies', href: '/movies' },
		{ name: 'TV Series', href: '/tvseries' },
		{ name: 'About', href: '/about' },
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
