'use client'

import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function useAuthActions() {
	const router = useRouter()
	const [loadingType, setLoadingType] = useState<'github' | 'google' | 'logout' | null>(
		null,
	)
	const signInWithGithub = async () => {
		setLoadingType('github')
		try {
			await authClient.signIn.social({
				provider: 'github',
				callbackURL: window.location.href,
			})
		} catch (error) {
			setLoadingType(null)
			console.error(error)
		}
	}

	const signInWithGoogle = async () => {
		setLoadingType('google')
		try {
			await authClient.signIn.social({
				provider: 'google',
				callbackURL: window.location.href,
				fetchOptions: {
					query: {
						prompt: 'select_account',
					},
				},
			})
		} catch (error) {
			console.error(error)
		} finally {
			setLoadingType(null)
		}
	}

	const signOut = async () => {
		setLoadingType('logout')
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.refresh()
				},
			},
		})
		setLoadingType(null)
	}

	return {
		signInWithGithub,
		signInWithGoogle,
		signOut,
		loadingType,
	}
}
