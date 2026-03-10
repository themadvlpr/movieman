import { auth } from '@/lib/auth'
import { headers } from 'next/headers'


export async function getAuthSession() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})
		return session
	} catch (error) {
		console.error('Auth session error:', error)
		return null
	}
}
