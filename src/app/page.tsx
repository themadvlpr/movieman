import SignInButtons from '@/components/ui/SignInButtons/SignInButtons'
import { LogOutButton } from './LogOutButton'

import { getAuthSession } from '@/lib/auth-sessions'

export default async function Home() {
	const session = await getAuthSession()

	return (
		<div>
			<h1 className='text-5xl'>Welcome to MovieMan</h1>
			<p>It is our movie app</p>
			<p>And you are: {session?.user.name || 'incognito'}</p>

			{session ? <LogOutButton /> : <SignInButtons />}
		</div>
	)
}
