// app/layout.tsx
import type { Metadata } from 'next'
import { Montserrat, Geist } from 'next/font/google'
import '../globals.css'
import Header from '@/components/header/Header'
import Footer from '@/components/Footer'
import PageTransition from '@/components/utils/PageTransition'
import ScrollToTop from '@/components/ui/ScrollToTop'
import Providers from '@/components/utils/Providers'
import { Suspense } from 'react'
import Loader from '@/components/ui/Loader'
import { getAuthSession } from '@/lib/auth-sessions'
import { Toaster } from 'sonner';
import { Locale } from "@/lib/i18n/languageconfig";
import { cn } from "@/lib/utils";
import { trackVisit } from "@/lib/actions/analytics";
import { headers } from "next/headers";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

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


// app/[locale]/layout.tsx

export default async function RootLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}>) {

	const { locale } = (await params) as { locale: Locale };

	const session = await getAuthSession();

	const headerList = await headers();
	const currentPath = headerList.get("x-current-path") || "/";

	trackVisit(currentPath).catch(err => console.error(err));

	return (
		<html lang={locale || 'en'} className={cn("font-sans", geist.variable)}>
			<body
				className={`${montserrat.className} antialiased bg-zinc-950 text-zinc-100 selection:bg-white selection:text-black overflow-x-hidden transition-colors duration-500`}
				suppressHydrationWarning
			>
				<Providers locale={locale}>
					<div className='flex flex-col min-h-dvh'>
						<Header userSession={session} />
						<main className='flex-1 flex flex-col'>
							<Suspense fallback={<Loader />}>
								<PageTransition>
									{children}
								</PageTransition>
							</Suspense>
						</main>
						<ScrollToTop />
						<Footer />
					</div>
				</Providers>
				<Toaster theme="dark" closeButton position="bottom-right" richColors />
			</body>
		</html>
	)
}