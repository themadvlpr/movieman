'use client'

import { useAuthActions } from '@/hooks/use-auth-actions'

export function LogOutButton() {
	const { signOut, loadingType } = useAuthActions()

	return (
		<button
			onClick={signOut}
			disabled={loadingType === 'github' || loadingType === 'google'}
			className='p-2 bg-black text-white rounded disabled:opacity-50'
		>
			{loadingType !== null ? 'Loading...' : 'Log out!'}
		</button>
	)
}
