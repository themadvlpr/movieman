import { LogOutButton } from '../components/ui/SignInButtons/LogOutButton'

import { getAuthSession } from '@/lib/auth-sessions'

export default async function Home() {
	const session = await getAuthSession()

	return (
		<div className='flex-1 relative'>
			<div className='absolute top-0 inset-0 overflow-hidden'>
				<div className='relative h-full'>
					<img
						src={`https://image.tmdb.org/t/p/original//1gLFGrxHqQebqLWpISmoFR6XWtJ.jpg`}
						alt='Backdrop'
						className='w-full h-full object-cover object-top animate-[kenburns_20s_ease-in-out_infinite_alternate]'
						style={{
							animation:
								'kenburns 20s ease-in-out infinite alternate',
						}}
					/>
					<div className='absolute inset-0 bg-linear-to-b from-black/10 via-black/20 to-[#010101] via-60%'></div>
					<div className='absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent via-50%'></div>
					<div className='absolute inset-0 bg-linear-to-t from-[#010101] via-transparent to-transparent opacity-10'></div>
				</div>
			</div>
		</div>
	)
}
