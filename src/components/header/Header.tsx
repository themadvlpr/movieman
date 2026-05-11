import SearchBar from '@/components/header/SearchBar'
import MobileMenu from '@/components/header/MobileMenu'
import NavLinks from '@/components/header/NavLinks'
import Link from 'next/link'
import HeaderClient from '@/components/header/HeaderClient'
import LanguageSwitcher from '@/components/header/LanguageSwitcher'
import HeaderUserSection from '@/components/header/UserSection/HeaderUserSection'
import { Suspense } from 'react'

export default function Header() {

    return (
        <HeaderClient>
            <Link href='/'>
                <h1 className='text-2xl sm:text-3xl font-semibold 
                   bg-linear-to-r from-zinc-100 via-zinc-400 to-zinc-600 bg-clip-text text-transparent
                   animate-shimmer cursor-pointer'>
                    MovieMan
                </h1>
            </Link>
            <div className='flex items-center gap-2 sm:gap-4 md:gap-4 lg:gap-6'>
                <SearchBar />
                <NavLinks />
                <div className='hidden sm:block'>
                    <LanguageSwitcher />
                </div>
                <div className='block lg:hidden'>
                    <MobileMenu />
                </div>
                <div className="flex items-center justify-end">
                    <Suspense fallback={<div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-zinc-800 animate-pulse" />}>
                        <HeaderUserSection />
                    </Suspense>
                </div>
            </div>
        </HeaderClient>
    )
}
