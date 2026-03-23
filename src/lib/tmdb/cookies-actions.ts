'use server'
import { cookies } from 'next/headers'

export async function updateViewMode(mode: 'grid' | 'list', page: 'movies' | 'tvseries') {
    const cookieStore = await cookies()
    cookieStore.set(`${page}ViewMode`, mode)
}