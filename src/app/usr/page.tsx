import { LogOutButton } from '../../components/ui/SignInButtons/LogOutButton'
import SignInButtons from '@/components/ui/SignInButtons/SignInButtons'
import { getAuthSession } from '@/lib/auth-sessions'

export default async function User() {
	const session = await getAuthSession()

	return (
		<main>
			<h1>Закрытая панель управления</h1>
			{session ? (
				<div>
					<p>Добро пожаловать, {session?.user.name}</p>
					<img src={session?.user.image as string} alt='kke' />
					<LogOutButton />
				</div>
			) : (
				<div>
					<p>Who are you?!</p>
					<SignInButtons />
				</div>
			)}
		</main>
	)
}
