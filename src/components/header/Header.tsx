import Link from 'next/link'
import HeaderAuthControlsButton from '@/components/header/HeaderAuthControlsButton'
import { getAuthSession } from '@/lib/auth-sessions'
import SearchBar from './SearchBar'
import MobileMenu from './MobileMenu'
import UserDropdownMenu from './UserDropdownMenu'
import HeaderClient from './HeaderClient'
import NavLinks from './NavLinks'

export default async function Header() {
	const session = await getAuthSession()

	return (
		<HeaderClient>
				<Link href='/'>
					<h1 className='text-2xl sm:text-3xl font-semibold 
                   bg-linear-to-r from-zinc-100 via-zinc-400 to-zinc-600 bg-clip-text text-transparent
                   animate-shimmer cursor-pointer'>
						MovieMan
					</h1>
				</Link>
				<div className='flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-10'>
					<SearchBar />
					<NavLinks />
					<div className='block lg:hidden'>
						<MobileMenu />
					</div>
					{session ? (
						<UserDropdownMenu user={session.user} />
					) : (
						<HeaderAuthControlsButton />
					)}
				</div>
		</HeaderClient>
	)
}
