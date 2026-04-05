'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Calendar, User } from 'lucide-react'
import { PersonDetailProps, MergedCredit, RawCredit } from '@/lib/tmdb/types/tmdb-types'
import DetailCarousel from '../ui/DetailCarousel'
import { CreditCard } from './CreditCard'
import { useTranslation } from "@/providers/LocaleProvider"

const mergeCredits = (credits: RawCredit[]): MergedCredit[] => {
    const merged: Record<string, MergedCredit> = {}
    credits.forEach((item) => {
        const id = item.id.toString()
        if (!merged[id]) {
            merged[id] = {
                ...item,
                characters: ('character' in item && item.character) ? [item.character] : [],
                jobs: ('job' in item && item.job) ? [item.job] : []
            } as MergedCredit
        } else {
            if ('character' in item && item.character && !merged[id].characters?.includes(item.character)) {
                merged[id].characters?.push(item.character)
            }
            if ('job' in item && item.job && !merged[id].jobs?.includes(item.job)) {
                merged[id].jobs?.push(item.job)
            }
        }
    })
    return Object.values(merged).map((item) => ({
        ...item,
        character: item.characters?.join(' / ') || ('character' in item ? item.character : '') || '',
        job: item.jobs?.join(' / ') || ('job' in item ? item.job : '') || ''
    }))
}

export default function PersonDetailContent({ data }: { data: PersonDetailProps }) {
    const { t } = useTranslation()
    const { person, movieCredits, tvCredits } = data
    const [isOverviewExpanded, setIsOverviewExpanded] = useState(false)
    const [visibleCountMovies, setVisibleCountMovies] = useState(12)
    const [visibleCountTv, setVisibleCountTv] = useState(12)

    const { movieWorks, tvWorks, bestCombined } = useMemo(() => {
        const isActor = person.known_for_department === 'Acting'

        const mWorks = isActor
            ? mergeCredits(movieCredits.cast)
            : mergeCredits(movieCredits.crew.filter(c => c.department === person.known_for_department))

        const tWorks = isActor
            ? mergeCredits(tvCredits.cast)
            : mergeCredits(tvCredits.crew.filter(c => c.department === person.known_for_department))

        const bestCombined = [...mWorks, ...tWorks]
            .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
            .slice(0, 18)

        return { movieWorks: mWorks, tvWorks: tWorks, bestCombined }
    }, [person, movieCredits, tvCredits])

    return (
        <div className='flex-1 relative bg-black text-white min-h-screen'>
            {/* Backdrop */}
            {person.profile_path && (
                <div className='absolute inset-0 h-[35vh] sm:h-[45vh] lg:h-[80vh] w-full overflow-hidden pointer-events-none'>
                    <Image
                        src={`https://image.tmdb.org/t/p/original${person.profile_path}`}
                        alt={person.name} fill priority className='object-cover opacity-20 blur-3xl scale-110'
                    />
                    <div className='absolute inset-0 bg-linear-to-t from-black via-black/60 to-black/20 lg:from-black' />
                    <div className='absolute inset-0 bg-linear-to-r from-black via-transparent to-transparent lg:from-black/90' />
                </div>
            )}

            <div className='relative z-10 pt-32 pb-20 px-4 sm:px-8 md:px-12 lg:px-20'>
                <div className='flex flex-col lg:flex-row gap-10 lg:gap-16'>
                    {/* Profile Image */}
                    <div className='w-48 sm:w-64 lg:w-80 shrink-0 mx-auto lg:mx-0'>
                        <div className='relative aspect-2/3 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10'>
                            <Image
                                src={person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : '/no-photo.png'}
                                alt={person.name} fill priority className='object-cover'
                            />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className='flex-1 flex flex-col gap-8 lg:pt-8'>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className='space-y-6'>
                            <h1 className='text-5xl sm:text-7xl font-bold leading-[0.9] text-mdnichrome text-center lg:text-left'>{person.name}</h1>
                            <div className='flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm font-semibold text-zinc-400'>
                                <div className='flex items-center gap-1.5 text-zinc-100'><User className='w-4 h-4' /><span>{t('common', person.known_for_department)}</span></div>
                                {person.birthday && (
                                    <div className='flex items-center gap-1.5 text-zinc-300'>
                                        <span className='text-zinc-800'>|</span>
                                        <Calendar className='w-4 h-4' />
                                        <span>{person.birthday.split('-').reverse().join('-')}{person.deathday && ` — ${person.deathday}`}</span>
                                    </div>
                                )}
                                {person.place_of_birth && (
                                    <div className='flex items-center gap-1.5 text-zinc-300'>
                                        <span className='text-zinc-800'>|</span>
                                        <MapPin className='w-4 h-4' /><span>{person.place_of_birth}</span>
                                    </div>
                                )}
                            </div>

                            {person.biography && (
                                <div className="max-w-3xl mx-auto lg:mx-0 pt-4">
                                    <h3 className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-3'>{t('common', 'biography')}</h3>
                                    <p className={`text-zinc-300 leading-relaxed text-base sm:text-lg font-medium whitespace-pre-wrap ${!isOverviewExpanded ? 'line-clamp-4' : ''}`}>
                                        {person.biography}
                                    </p>
                                    {person.biography.length > 280 && (
                                        <button onClick={() => setIsOverviewExpanded(!isOverviewExpanded)} className='text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-3 hover:text-white'>
                                            {isOverviewExpanded ? t('common', 'showLess') : t('common', 'readMore')}
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                <hr className='border-white/10 my-20' />
                <DetailCarousel type='person-credits' items={bestCombined} mediaType='all' />
                <hr className='border-white/10 my-20' />

                {/* Filmography: Movies */}
                <section className='mb-40'>
                    <h2 className='text-4xl font-bold mb-2 text-mdnichrome'>{t('common', 'movieFilmography')}</h2>
                    <p className='text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mb-12'>{t('common', 'comprehensiveFilmHistory')}</p>
                    <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4'>
                        {movieWorks.slice(0, visibleCountMovies).map((work, idx) => (
                            <CreditCard key={`movie-${work.id}`} work={work} index={idx} type="movie" />
                        ))}
                    </div>
                    {visibleCountMovies < movieWorks.length && (
                        <div className='mt-16 flex justify-center'>
                            <button onClick={() => setVisibleCountMovies(v => v + 12)} className='px-8 py-3 bg-zinc-900 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-white'>
                                {t('common', 'loadMoreMovies')}
                            </button>
                        </div>
                    )}
                </section>

                {/* Filmography: TV */}
                <section className='pb-20'>
                    <h2 className='text-4xl font-bold mb-2 text-mdnichrome'>{t('common', 'tvFilmography')}</h2>
                    <p className='text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mb-12'>{t('common', 'comprehensiveTVHistory')}</p>
                    <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4'>
                        {tvWorks.slice(0, visibleCountTv).map((work, idx) => (
                            <CreditCard key={`tv-${work.id}`} work={work} index={idx} type="tv" />
                        ))}
                    </div>
                    {visibleCountTv < tvWorks.length && (
                        <div className='mt-16 flex justify-center'>
                            <button onClick={() => setVisibleCountTv(v => v + 12)} className='px-8 py-3 bg-zinc-900 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-white'>
                                {t('common', 'loadMoreSeries')}
                            </button>
                        </div>
                    )}
                </section>
            </div>
            <style jsx>{`.text-mdnichrome { font-family: var(--font-nichrome), serif; }`}</style>
        </div>
    )
}