'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Calendar, ChevronRight, List, Info, Globe, Play } from 'lucide-react'
import VideoModal from '@/components/ui/VideoModal'
import LibraryControlsButtons from '@/components/ui/LibraryControlsButtons'
import { CrewMember, MainTvCrewItem, TvSeriesDetailProps } from '@/lib/tmdb/types/tmdb-types'
import DetailCarousel from '@/components/ui/DetailCarousel'
import { dbState } from '@/lib/tmdb/types/db-types'
import { updateMediaDetailsAction } from '@/lib/actions/updateMediaDetailsAction'
import { toast } from "sonner"
import { useTranslation } from '@/providers/LocaleProvider'

interface Props {
    data: TvSeriesDetailProps & { initialDbState?: dbState };
    userId: string;
}

export default function TvSeriesDetailContent({ data, userId }: Props) {
    const { series, credits, similarSeries, initialDbState } = data;
    const { t } = useTranslation();

    // Все стейты теперь вызываются по порядку при каждом рендере
    const [imageLoading, setImageLoading] = useState(true);
    const [showFullDate, setShowFullDate] = useState(false);
    const [watchDate, setWatchDate] = useState(
        initialDbState?.watchedDate
            ? new Date(initialDbState.watchedDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    )
    const [personalRating, setPersonalRating] = useState(initialDbState?.userRating || 1)
    const [note, setNote] = useState(initialDbState?.userComment || '')
    const [isCreatorsExpanded, setIsCreatorsExpanded] = useState(false)
    const [isOverviewExpanded, setIsOverviewExpanded] = useState(false)
    const [isVideoOpen, setIsVideoOpen] = useState(false)
    const [editNote, setEditNote] = useState(false)

    // Handlers
    const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setWatchDate(newDate);
        const toastId = toast.loading("Saving date...");
        const result = await updateMediaDetailsAction(series.id, 'tv', { watchedDate: new Date(newDate) });
        if (result.success) toast.success("Date updated", { id: toastId });
        else toast.error(result.error || "Error", { id: toastId });
    }

    const handleRatingChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRating = parseInt(e.target.value);
        setPersonalRating(newRating);
        const toastId = toast.loading("Saving rating...");
        const result = await updateMediaDetailsAction(series.id, 'tv', { userRating: newRating });
        if (result.success) toast.success("Rating updated", { id: toastId });
        else toast.error(result.error || "Error", { id: toastId });
    }

    useEffect(() => {
        const currentNote = note.trim();
        const savedNote = initialDbState?.userComment || '';
        const timer = setTimeout(async () => {
            if (initialDbState?.isWatched && currentNote !== savedNote) {
                const toastId = toast.loading("Saving comment...");
                const result = await updateMediaDetailsAction(series.id, 'tv', { userComment: currentNote });
                if (result.success) toast.success("Comment updated", { id: toastId });
                else toast.error(result.error || "Error", { id: toastId });
            }
        }, 2000); // Сократил до 2с для отзывчивости
        return () => clearTimeout(timer);
    }, [note, series.id, initialDbState]);

    const handleSaveNote = async () => {
        setEditNote(false);
        const toastId = toast.loading("Saving comment...");
        const result = await updateMediaDetailsAction(series.id, 'tv', { userComment: note });
        if (result.success) toast.success("Comment updated", { id: toastId });
        else toast.error(result.error || "Error", { id: toastId });
    }

    const trailer = series.videos?.results.find(v => v.type === 'Trailer') || series.videos?.results[0];

    // Crew Logic
    const mainTvCrewMap: Record<number, MainTvCrewItem> = {};
    (series.created_by || []).forEach((c) => {
        mainTvCrewMap[c.id] = { id: c.id, name: c.name, jobs: ['Creator'] };
    });
    credits.crew.filter((c): c is CrewMember => c.job === 'Executive Producer' || c.job === 'Creator').forEach((c) => {
        if (!mainTvCrewMap[c.id]) mainTvCrewMap[c.id] = { id: c.id, name: c.name, jobs: [c.job!] };
        else if (!mainTvCrewMap[c.id].jobs.includes(c.job!)) mainTvCrewMap[c.id].jobs.push(c.job!);
    });
    const mainTvCrew = Object.values(mainTvCrewMap);

    return (
        <div className='flex-1 relative bg-black text-white min-h-screen'>
            {/* Backdrop Section */}
            <div className='absolute inset-0 h-[35vh] sm:h-[45vh] lg:h-screen w-full overflow-hidden pointer-events-none'>
                <AnimatePresence>
                    {imageLoading && (
                        <motion.div exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-900/90 z-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-14 h-14 rounded-full border-4 border-white/10 border-t-white/90 animate-spin" />
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">{t('common', 'loadingPoster')}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <Image
                    src={series.backdrop_path ? `https://image.tmdb.org/t/p/original${series.backdrop_path}` : '/back.jpg'}
                    alt={series.name || 'Backdrop'} fill priority className='object-cover opacity-40'
                    onLoad={() => setImageLoading(false)}
                />
                <div className='absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/20 lg:from-[#010101]' />
                <div className='absolute inset-0 bg-linear-to-r from-black via-transparent to-transparent lg:from-black/80' />
            </div>

            {/* Main Content */}
            <div className='relative z-10 pt-40 pb-20 px-4 sm:px-8 md:px-12 lg:px-20 mx-auto'>
                <div className='flex flex-col lg:flex-row gap-8 lg:gap-16'>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='hidden lg:block shrink-0 w-[300px] xl:w-[360px]'>
                        <div className='relative bg-zinc-900 aspect-2/3 rounded-3xl overflow-hidden border border-white/10'>
                            <Image src={series.poster_path ? `https://image.tmdb.org/t/p/w500${series.poster_path}` : '/no-poster.png'} alt={series.name} fill sizes="360px" className='object-cover' priority />
                        </div>
                    </motion.div>

                    <div className='max-w-3xl flex flex-col gap-8 flex-1'>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className='space-y-3'>
                            <h1 className='text-5xl sm:text-7xl font-bold leading-[0.9] text-mdnichrome'>{series.name}</h1>

                            <div className='flex mt-7 flex-wrap items-center gap-4 text-sm font-semibold text-zinc-400'>
                                {series.vote_average !== 0 && (
                                    <div className='flex items-center gap-1.5 text-zinc-100'>
                                        <Star className='w-4 h-4 fill-amber-400 text-amber-400' />
                                        <span>{series.vote_average?.toFixed(1)}</span>
                                    </div>
                                )}
                                <div className='flex items-center gap-1.5 text-zinc-300'><Globe className='w-4 h-4' /><span>{series.origin_country?.join(', ')}</span></div>
                            </div>

                            <div className='flex items-center gap-1.5 text-sm font-semibold text-zinc-300'>
                                <List className='w-4 h-4' />
                                <span>{series.number_of_seasons} {t('common', series.number_of_seasons !== 1 ? 'seasons' : 'season')} • {series.number_of_episodes} {t('common', series.number_of_episodes !== 1 ? 'episodes' : 'episode')}</span>
                            </div>

                            <div className='flex items-center gap-1.5 text-sm font-semibold text-zinc-300'>
                                <Calendar className='w-4 h-4' />
                                <span onClick={() => setShowFullDate(!showFullDate)} className="cursor-pointer hover:text-white transition-colors">
                                    {series.first_air_date ? (showFullDate ? series.first_air_date.split('-').reverse().join('-') : series.first_air_date.split('-')[0]) : '---'}
                                    {['Ended', 'Canceled'].includes(series.status!) && series.last_air_date ? ` – ${showFullDate ? series.last_air_date.split('-').reverse().join('-') : series.last_air_date.split('-')[0]}` : ` – ${t('common', 'present')}`}
                                </span>
                            </div>

                            <div className='flex flex-wrap gap-2'>
                                {series.genres?.map(g => (
                                    <span key={g.id} className='px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400'>{g.name}</span>
                                ))}
                            </div>

                            <div className="max-w-2xl mt-5">
                                <p className={`text-zinc-300 leading-relaxed text-lg ${!isOverviewExpanded ? 'line-clamp-4' : ''}`}>{series.overview}</p>
                                {series.overview && series.overview.length > 280 && (
                                    <button onClick={() => setIsOverviewExpanded(!isOverviewExpanded)} className='text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2 hover:text-white transition-colors'>
                                        {isOverviewExpanded ? t('common', 'showLess') : t('common', 'readMore')}
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {trailer && (
                            <button onClick={() => setIsVideoOpen(true)} className="flex w-fit items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors">
                                <Play className="w-4 h-4 fill-current" /><span>{t('common', 'playTrailer')}</span>
                            </button>
                        )}

                        <LibraryControlsButtons
                            mediaId={series.id}
                            mediaData={{ title: series.name, poster: series.poster_path, rating: series.vote_average, year: series.first_air_date, description: series.overview }}
                            type="tv" userId={userId} initialState={initialDbState || {}}
                        />

                        {initialDbState?.isWatched && (
                            <div className='bg-zinc-900/10 backdrop-blur-xl border border-white/5 rounded-xl p-3.5 space-y-4 max-w-[220px]'>
                                <div className='flex justify-between gap-4'>
                                    <div className='flex flex-col gap-1'>
                                        <label className='text-[8px] font-black uppercase text-zinc-700'>{t('common', 'watchedOn')}</label>
                                        <input type='date' value={watchDate} onChange={handleDateChange} className='bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-bold outline-none' />
                                    </div>
                                    <div className='flex flex-col gap-1'>
                                        <label className='text-[8px] font-black uppercase text-zinc-700'>{t('common', 'rating')}</label>
                                        <select value={personalRating} onChange={handleRatingChange} className='bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-bold outline-none appearance-none'>
                                            {[...Array(10)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {mainTvCrew.length > 0 && (
                            <div className='mt-4'>
                                <h3 className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6'>{t('common', 'mainCrew')}</h3>
                                <div className='flex flex-wrap gap-x-12 gap-y-6'>
                                    {mainTvCrew.slice(0, isCreatorsExpanded ? undefined : 3).map((person) => (
                                        <div key={person.id} className='flex flex-col gap-1'>
                                            <Link href={`/person/${person.id}`} className='text-xl sm:text-2xl font-bold hover:text-white transition-colors text-zinc-300'>{person.name}</Link>
                                            <span className='text-[10px] font-black uppercase tracking-widest text-zinc-600'>{person.jobs.join(' / ')}</span>
                                        </div>
                                    ))}
                                </div>
                                {mainTvCrew.length > 3 && (
                                    <button onClick={() => setIsCreatorsExpanded(!isCreatorsExpanded)} className='text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2 hover:text-white'>
                                        {isCreatorsExpanded ? t('common', 'showLess') : `+ ${mainTvCrew.length - 3} ${t('common', 'more')}`}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <hr className='border-white/10 my-12' />
                <DetailCarousel type='cast' items={credits.cast.slice(0, 100)} mediaType='tv' />

                {initialDbState?.isWatched && (
                    <section className='mt-20 max-w-4xl'>
                        <h2 className='text-4xl font-bold mb-2'>{t('common', 'myCommentary')}</h2>
                        {!editNote ? (
                            <>
                                <p className='text-lg font-medium text-zinc-300'>{note || initialDbState?.userComment}</p>
                                <button onClick={() => setEditNote(true)} className='mt-5 bg-white text-black px-4 py-2 rounded-md font-bold hover:bg-zinc-200'>
                                    {note ? t('common', 'editCommentary') : t('common', 'addCommentary')}
                                </button>
                            </>
                        ) : (
                            <div className='space-y-4'>
                                <div className='bg-white/5 border border-white/10 rounded-3xl p-6 shadow-3xl'>
                                    <textarea value={note} onChange={(e) => setNote(e.target.value)} className='w-full bg-transparent text-xl font-medium outline-none resize-none min-h-[200px]' placeholder={t('common', 'writeThoughtsPlaceholder')} />
                                </div>
                                <button onClick={handleSaveNote} className='bg-white text-black px-4 py-2 rounded-md font-bold'>{t('common', 'saveCommentary')}</button>
                            </div>
                        )}
                    </section>
                )}

                <DetailCarousel type='similar' items={similarSeries} mediaType='tv' />
            </div>

            <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} videoKey={trailer?.key || null} />

            <style jsx>{`
                .text-mdnichrome { font-family: var(--font-nichrome), serif; }
            `}</style>
        </div>
    )
}