'use client';

import { motion } from 'framer-motion';
import { LocalizedLink as Link } from '@/components/navigation/Link';
import { useTranslation } from '@/providers/LocaleProvider';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    const { t } = useTranslation();

    return (
        <div className="relative flex-1 w-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
            {/* Animated Background Elements */}



            <div className="relative z-10 flex flex-col items-center text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-[12rem] sm:text-[18rem] font-black leading-none tracking-tighter text-white/5 select-none text-mdnichrome">
                        404
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="-mt-12 sm:-mt-20"
                >
                    <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 text-mdnichrome uppercase tracking-tight">
                        {t('about', 'notFound')}
                    </h2>
                    <p className="text-zinc-500 text-base sm:text-lg max-w-md mx-auto mb-10 font-medium">
                        {t('about', 'pageNotFound')}
                    </p>
                    <p className='text-zinc-500 text-base sm:text-lg max-w-md mx-auto mb-10 font-medium'>
                        {t('about', 'notFoundDescription')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="group relative flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all duration-300"
                        >
                            <Home className="w-5 h-5" />
                            <span>{t('nav', 'home')}</span>
                        </Link>


                    </div>
                </motion.div>
            </div>

            {/* Decorative film grain/texture could be added here via CSS */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <style jsx>{`
                .text-mdnichrome {
                    font-family: var(--font-nichrome), serif;
                }
            `}</style>
        </div>
    );
}