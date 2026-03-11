import Link from 'next/link'
import HeaderAuthControlsButton from '@/components/header/HeaderAuthControlsButton'
import { getAuthSession } from '@/lib/auth-sessions'
import SearchBar from './SearchBar'

export default async function Header() {
	const session = await getAuthSession()

	return (
		<header className='w-full fixed top-0 left-0 right-0 z-50'>
			<div className='flex justify-between items-center px-2 sm:px-7 py-2 pb-0 sm:py-4 bg-linear-to-b from-black/80 via-black/40 to-transparent'>
				<Link href='/'>
					<h1 className='text-3xl font-semibold bg-linear-to-r from-zinc-100 via-zinc-400 to-zinc-600 bg-clip-text text-transparent'>
						MovieMan
					</h1>
				</Link>
				<SearchBar />
				<div className='flex items-center gap-10'>
					<ul className='flex gap-5 font-semibold text-lg text-zinc-400 '>
						<li>
							<Link href={'/movies'}>Movies</Link>
						</li>
						<li>
							<Link href={'/tvseries'}>TV Series</Link>
						</li>
						<li>
							<Link href={'/about'}>About</Link>
						</li>
					</ul>
					<HeaderAuthControlsButton />
				</div>
			</div>
		</header>
	)
}
