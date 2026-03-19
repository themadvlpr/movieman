// app/layout.tsx
import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import Header from '@/components/header/Header'
import Footer from '@/components/Footer'
import PageTransition from '@/components/PageTransition'
import ScrollToTop from '@/components/ui/ScrollToTop'


const montserrat = Montserrat({
	variable: '--font-montserrat',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'MovieMan',
	description: 'Search, collect and share your movie collection',
	icons: {
		icon: [
			{ url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
			{ url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
		],
		shortcut: '/icons/favicon.ico',
		apple: [
			{ url: '/icons/apple-touch-icon.png' },
		],
	},
	manifest: '/icons/site.webmanifest',
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
					<main className='flex-1 flex flex-col'>
						<PageTransition>{children}</PageTransition>
					</main>
					<ScrollToTop />
					<Footer />
				</div>
			</body>
		</html>
	)
}
