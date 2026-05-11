'use client'
import { useAuthActions } from '@/hooks/useAuthAction'
import { SocialAuthButton } from '@/components/header/SignInButtons/SocialAuthButton'

export default function SignInButtons() {
	const { signInWithGithub, signInWithGoogle, loadingType } = useAuthActions()

	return (
		<div className='flex flex-col gap-3 w-full'>
			<SocialAuthButton
				provider='google'
				onClick={signInWithGoogle}
				isLoading={loadingType === 'google'}
				disabled={!!loadingType}
			/>
			<SocialAuthButton
				provider='github'
				onClick={signInWithGithub}
				isLoading={loadingType === 'github'}
				disabled={!!loadingType}
			/>
		</div>
	)
}
