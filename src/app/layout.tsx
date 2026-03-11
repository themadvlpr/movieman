// app/layout.tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Montserrat } from 'next/font/google'
import './globals.css'
import Header from '@/components/header/Header'
import Footer from '@/components/Footer'


const montserrat = Montserrat({
	variable: '--font-montserrat',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'MovieMan',
	description: 'Search, collect and share your movie collection',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en'>
			<body
				className={`${montserrat.variable} antialiased bg-zinc-950 text-zinc-100`}
			>
				<div className='flex flex-col  min-h-dvh'>
					<Header />
					<main className='flex-1 flex flex-col'>{children}</main>
					<Footer />
				</div>
			</body>
		</html>
	)
}
