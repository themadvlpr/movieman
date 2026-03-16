'use client'

import { useState, useEffect, ReactNode } from 'react'

interface HeaderClientProps {
    children: ReactNode
}

export default function HeaderClient({ children }: HeaderClientProps) {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 27) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        // Initialize state on mount
        handleScroll()

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header
            className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out
                ${isScrolled
                    ? 'bg-zinc-950/95 backdrop-blur-md'
                    : 'bg-transparent'}`}
        >
            <div
                className={`flex justify-between items-center px-2 sm:px-7 py-2 pb-0 sm:py-4 transition-all duration-500
                ${isScrolled
                        ? 'bg-transparent'
                        : 'bg-linear-to-b from-black/80 via-black/40 to-transparent pb-2'}`}
            >
                {children}
            </div>
        </header>
    )
}
