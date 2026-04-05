'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Clock, Calendar, ChevronRight, Globe, Play } from 'lucide-react'
import VideoModal from '../ui/VideoModal'
import LibraryControlsButtons from '@/components/ui/LibraryControlsButtons'
import DetailCarousel from '../ui/DetailCarousel'
import { updateMediaDetailsAction } from '@/lib/actions/updateMediaDetailsAction'
import { toast } from "sonner"
import { useTranslation } from '@/providers/LocaleProvider'
import { MovieDetailProps } from '@/lib/tmdb/types/tmdb-types'
import { dbState } from '@/lib/tmdb/types/db-types'

interface Props {
    data: MovieDetailProps & { initialDbState?: dbState };
    userId: string;
}

export default function MovieDetailContent({ data, userId }: Props) {
    const { movie, credits, similarMovies, initialDbState } = data;
    const { t } = useTranslation();

    const [imageLoading, setImageLoading] = useState(true);
    const [watchDate, setWatchDate] = useState(
        initialDbState?.watchedDate
            ? new Date(initialDbState.watchedDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    )
    const [personalRating, setPersonalRating] = useState(initialDbState?.userRating || 1)
    const [note, setNote] = useState(initialDbState?.userComment || '')
    const [isOverviewExpanded, setIsOverviewExpanded] = useState(false)
    const [isVideoOpen, setIsVideoOpen] = useState(false)
    const [editNote, setEditNote] = useState(false)

    // Handlers
    const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setWatchDate(newDate);
        const toastId = toast.loading("Saving date...");
        const result = await updateMediaDetailsAction(movie.id, 'movie', { watchedDate: new Date(newDate) });
        if (result.success) toast.success("Date updated", { id: toastId });
        else toast.error(result.error || "Error", { id: toastId });
    }

    const handleRatingChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRating = parseInt(e.target.value);
        setPersonalRating(newRating);
        const toastId = toast.loading("Saving rating...");
        const result = await updateMediaDetailsAction(movie.id, 'movie', { userRating: newRating });
        if (result.success) toast.success("Rating updated", { id: toastId });
        else toast.error(result.error || "Error", { id: toastId });
    }

    useEffect(() => {
        const currentNote = note.trim();
        const savedNote = initialDbState?.userComment || '';
        const timer = setTimeout(async () => {
            if (initialDbState?.isWatched && currentNote !== savedNote) {
                const toastId = toast.loading("Saving comment...");
                const result = await updateMediaDetailsAction(movie.id, 'movie', { userComment: currentNote });
                if (result.success) toast.success("Comment updated", { id: toastId });
                else toast.error(result.error || "Error", { id: toastId });
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [note, movie.id, initialDbState]);

    const handleSaveNote = async () => {
        setEditNote(false);
        const toastId = toast.loading("Saving...");
        const result = await updateMediaDetailsAction(movie.id, 'movie', { userComment: note });
        if (result.success) toast.success("Comment saved", { id: toastId });
        else toast.error(result.error || "Error", { id: toastId });
    }

    const trailer = movie.videos?.results.find(v => v.type === 'Trailer') || movie.videos?.results[0]

    // Crew Logic
    const mainCrewMap: Record<number, { name: string, jobs: string[], id: number }> = {}
    credits.crew.forEach(c => {
        if (['Director', 'Writer', 'Screenplay'].includes(c.job!)) {
            if (!mainCrewMap[c.id]) mainCrewMap[c.id] = { id: c.id, name: c.name, jobs: [c.job!] }
            else if (!mainCrewMap[c.id].jobs.includes(c.job!)) mainCrewMap[c.id].jobs.push(c.job!)
        }
    })
    const mainCrew = Object.values(mainCrewMap)

    const formatRuntime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    }

    return (
        <div className='flex-1 relative bg-black text-white min-h-screen'>
            {/* Backdrop */}
            <div className='absolute inset-0 h-[35vh] sm:h-[45vh] lg:h-screen w-full overflow-hidden pointer-events-none'>
                <AnimatePresence>
                    {imageLoading && (
                        <motion.div exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-900/90 z-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-14 h-14 rounded-full border-4 border-white/10 border-t-white/90 animate-spin" />
                            <span className="text-xs font-bold tracking-[0.3em] text-white/40 uppercase">{t('common', 'loadingPoster')}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <Image
                    src={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '/back.jpg'}
                    alt={movie.title} fill priority className='object-cover opacity-40'
                    onLoad={() => setImageLoading(false)}
                />
                <div className='absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/20 lg:from-[#010101]' />
                <div className='absolute inset-0 bg-linear-to-r from-black via-transparent to-transparent lg:from-black/80' />
            </div>

            {/* Content */}
            <div className='relative z-10 pt-40 pb-20 px-4 sm:px-8 md:px-12 lg:px-20 mx-auto'>
                <div className='flex flex-col lg:flex-row gap-8 lg:gap-16'>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='hidden lg:block shrink-0 w-[300px] xl:w-[360px]'>
                        <div className='relative bg-zinc-900 aspect-2/3 rounded-3xl overflow-hidden border border-white/10'>
                            <Image src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-poster.png'} alt={movie.title} fill sizes="360px" className='object-cover' priority />
                        </div>
                    </motion.div>

                    <div className='max-w-3xl flex flex-col gap-8 flex-1'>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className='space-y-6'>
                            <h1 className='text-5xl sm:text-7xl font-bold leading-[0.9] text-mdnichrome'>{movie.title}</h1>

                            <div className='flex flex-wrap items-center gap-4 text-sm font-semibold text-zinc-400'>
                                {movie.vote_average !== 0 && (
                                    <div className='flex items-center gap-1.5 text-zinc-100'>
                                        <Star className='w-4 h-4 fill-amber-400 text-amber-400' />
                                        <span>{movie.vote_average.toFixed(1)}</span>
                                    </div>
                                )}
                                <div className='flex items-center gap-1.5'><Calendar className='w-4 h-4' /><span>{movie.release_date.split('-').reverse().join('-')}</span></div>
                                <div className='flex items-center gap-1.5'><Clock className='w-4 h-4' /><span>{formatRuntime(movie.runtime)}</span></div>
                            </div>

                            <div className='flex flex-wrap gap-2'>
                                {movie.genres.map(g => (
                                    <span key={g.id} className='px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400'>{g.name}</span>
                                ))}
                            </div>

                            <div className="max-w-2xl">
                                <p className={`text-zinc-300 leading-relaxed text-lg ${!isOverviewExpanded ? 'line-clamp-4' : ''}`}>{movie.overview}</p>
                                {movie.overview && movie.overview.length > 280 && (
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
                            mediaId={movie.id}
                            mediaData={{ title: movie.title, poster: movie.poster_path, rating: movie.vote_average, year: movie.release_date, description: movie.overview }}
                            type="movie" userId={userId} initialState={initialDbState || {}}
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
                    </div>
                </div>

                <hr className='border-white/10 my-12' />
                <DetailCarousel type='cast' items={credits.cast} mediaType='movie' />

                {initialDbState?.isWatched && (
                    <section className='mt-20 max-w-4xl'>
                        <h2 className='text-4xl font-bold mb-2'>My commentary</h2>
                        {!editNote ? (
                            <>
                                <p className='text-lg font-medium text-zinc-300'>{note || initialDbState?.userComment}</p>
                                <button onClick={() => setEditNote(true)} className='mt-5 bg-white text-black px-4 py-2 rounded-md font-bold hover:bg-zinc-200 transition-colors'>
                                    {note ? t('common', 'editCommentary') : t('common', 'addCommentary')}
                                </button>
                            </>
                        ) : (
                            <div className='space-y-4'>
                                <div className='bg-white/5 border border-white/10 rounded-3xl p-6'>
                                    <textarea value={note} onChange={(e) => setNote(e.target.value)} className='w-full bg-transparent text-xl font-medium outline-none border-none resize-none min-h-[200px]' placeholder={t('common', 'writeThoughtsPlaceholder')} />
                                </div>
                                <button onClick={handleSaveNote} className='bg-white text-black px-4 py-2 rounded-md font-bold'>{t('common', 'saveCommentary')}</button>
                            </div>
                        )}
                    </section>
                )}

                <DetailCarousel type='similar' items={similarMovies} mediaType='movie' />
            </div>

            <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} videoKey={trailer?.key || null} />

            <style jsx>{`
                .text-mdnichrome { font-family: var(--font-nichrome), serif; }
            `}</style>
        </div>
    )
}