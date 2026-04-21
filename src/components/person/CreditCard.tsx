'use client'

import { LocalizedLink as Link } from '@/components/navigation/Link';
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { MergedCredit } from '@/lib/tmdb/types/tmdb-types'

interface CreditCardProps {
    work: MergedCredit;
    index: number;
    type: 'movie' | 'tv';
}

export function CreditCard({ work, index, type }: CreditCardProps) {
    const title = work.title || work.name || 'Untitled'
    const date = work.release_date || work.first_air_date
    const year = date?.slice(0, 4) || '—'
    const href = type === 'movie' ? `/movies/${work.id}` : `/tvseries/${work.id}`

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay: (index % 12) * 0.05,
                ease: [0.23, 1, 0.32, 1]
            }}
        >
            <Link href={href} className='group flex flex-col'>
                <div className='relative aspect-2/3 rounded-lg overflow-hidden mb-2 bg-zinc-900 ring-1 ring-white/5 group-hover:ring-white/20 transition-all duration-500 shadow-xl'>
                    {work.poster_path ? (
                        <Image
                            src={`https://image.tmdb.org/t/p/w342${work.poster_path}`}
                            alt={title}
                            fill
                            sizes='(max-width: 640px) 33vw, 15vw'
                            className='object-cover group-hover:scale-110 transition-transform duration-700 ease-out'
                        />
                    ) : (
                        <div className='w-full h-full flex items-center justify-center text-zinc-700 text-[8px] font-bold'>NO POSTER</div>
                    )}
                    <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                        <Play className='w-6 h-6 fill-white ml-0.5' />
                    </div>
                </div>
                <h4 className='font-bold text-[11px] text-zinc-300 group-hover:text-white transition-colors truncate uppercase tracking-tight'>
                    {title}
                </h4>
                <div className='flex items-center justify-between mt-0.5'>
                    <p className='text-[9px] text-zinc-600 font-bold truncate pr-1'>
                        {work.character ? `as ${work.character}` : (work.job || 'Role Unknown')}
                    </p>
                    <span className='text-[9px] text-zinc-700 font-black shrink-0'>{year}</span>
                </div>
            </Link>
        </motion.div>
    )
}