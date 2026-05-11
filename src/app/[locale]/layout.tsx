import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "@/app/globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from "next-intl/server";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer";
import { CookiesProvider } from 'next-client-cookies/server';
import Providers from "@/providers/Providers";


const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
    display: "swap"
});

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


export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const locale = await getLocale();
    const messages = await getMessages();
    const htmlLang = locale === 'ua' ? 'uk' : locale;

    return (
        <html lang={htmlLang}>
            <body suppressHydrationWarning className={`${montserrat.variable} antialiased`}>
                <CookiesProvider>
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <Providers>
                            <div className='flex flex-col min-h-dvh'>
                                <Header />
                                <main className='flex-1 flex flex-col'>
                                    {children}
                                </main>
                                <Footer />
                            </div>
                        </Providers>
                    </NextIntlClientProvider>
                </CookiesProvider>
            </body>
        </html>
    );
}
