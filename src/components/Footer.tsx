'use client'

import { usePathname } from 'next/navigation'

export default function Footer() {
	const pathname = usePathname()
	if (pathname === '/') return null // hide on main page!

	return (
		<footer className='w-full font-semibold flex justify-center items-center px-2 sm:px-7 pt-5 pb-1 sm:pb-3'>
			MovieMan {new Date().getFullYear()}
		</footer>
	)
}


