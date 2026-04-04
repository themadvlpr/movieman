'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect } from 'react'
import { LocaleProvider } from '@/providers/LocaleProvider'
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000 * 60,
                refetchOnWindowFocus: true,
            },
        },
    }))

    useEffect(() => {
        const unsubscribe = broadcastQueryClient({
            queryClient,
            broadcastChannel: 'movie-app-channel',
        })

        return () => {
            unsubscribe()
        }
    }, [queryClient])

    return (
        <QueryClientProvider client={queryClient}>
            <LocaleProvider>
                {children}
            </LocaleProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}