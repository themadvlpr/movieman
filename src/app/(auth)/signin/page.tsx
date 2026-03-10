import { Metadata } from 'next'
import SignInButtons from '@/components/ui/SignInButtons/SignInButtons'
import { getAuthSession } from '@/lib/auth-sessions'

export const metadata: Metadata = {
	title: 'MovieMan | Sign in',
	description: 'Sign in to your account',
}

export default async function SignInPage() {
	const session = await getAuthSession()
    
	return (
		<main className='min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4'>
			<section className='relative z-10 w-full max-w-[400px]'>
				<div className='bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl'>
					{session ? (
						<div>Hello {session?.user.name}</div>
					) : (
						<div
							role='group'
							aria-labelledby='social-login'
							className='flex flex-col gap-3 w-full justify-center items-center'
						>
							<h2 className='text-center'>
								Social Authentication
							</h2>
							<SignInButtons />
						</div>
					)}

					<footer className='mt-8'>
						<p className='text-center text-[12px] text-slate-400'>
							Secure SSL Connection
						</p>
					</footer>
				</div>
			</section>
		</main>
	)
}
