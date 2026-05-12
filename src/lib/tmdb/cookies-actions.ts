'use server'
import { cookies } from 'next/headers'

export async function updateViewMode(mode: 'grid' | 'list', page: 'movies' | 'tvseries' | 'library') {
    const cookieStore = await cookies()
    cookieStore.set(`${page}ViewMode`, mode)
}