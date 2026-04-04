import Link from 'next/link'
import HeaderAuthControlsButton from '@/components/header/HeaderAuthControlsButton'
import SearchBar from './SearchBar'
import MobileMenu from './MobileMenu'
import UserDropdownMenu from './UserDropdownMenu'
import HeaderClient from './HeaderClient'
import NavLinks from './NavLinks'
import LanguageSwitcher from './LanguageSwitcher'

type UserSession = {
	session: {
		id: string;
		createdAt: Date;
		updatedAt: Date;
		userId: string;
		expiresAt: Date;
		token: string;
		ipAddress?: string | null | undefined;
		userAgent?: string | null | undefined;
	};
	user: {
		id: string;
		createdAt: Date;
		updatedAt: Date;
		email: string;
		emailVerified: boolean;
		name: string;
		image?: string | null | undefined;
	};
} | null

export default async function Header({ userSession }: { userSession: UserSession | null }) {

	return (
		<HeaderClient>
			<Link href='/'>
				<h1 className='text-2xl sm:text-3xl font-semibold 
                   bg-linear-to-r from-zinc-100 via-zinc-400 to-zinc-600 bg-clip-text text-transparent
                   animate-shimmer cursor-pointer'>
					MovieMan
				</h1>
			</Link>
			<div className='flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8'>
				<SearchBar />
				<NavLinks />
				<div className='hidden sm:block'>
					<LanguageSwitcher />
				</div>
				<div className='block lg:hidden'>
					<MobileMenu />
				</div>
				{userSession ? (
					<UserDropdownMenu user={userSession.user} />
				) : (
					<HeaderAuthControlsButton />
				)}
			</div>
		</HeaderClient>
	)
}
