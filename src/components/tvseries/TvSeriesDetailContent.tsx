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
    const [imageLoading, setImageLoading] = useState(true);
    const [showFullDate, setShowFullDate] = useState(false);
    const { t } = useTranslation();
    const { series, credits, similarSeries, initialDbState } = data

    const [watchDate, setWatchDate] = useState(
        initialDbState?.watchedDate
            ? new Date(initialDbState.watchedDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    )
    const [personalRating, setPersonalRating] = useState(initialDbState?.userRating || 0)
    const [note, setNote] = useState(initialDbState?.userComment || '')
    const [isCreatorsExpanded, setIsCreatorsExpanded] = useState(false)
    const [isOverviewExpanded, setIsOverviewExpanded] = useState(false)
    const [isVideoOpen, setIsVideoOpen] = useState(false)
    const [editNote, setEditNote] = useState(false)


    const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setWatchDate(newDate);
        const toastId = toast.loading("Saving date...");
        const result = await updateMediaDetailsAction(series.id, 'tv', { watchedDate: new Date(newDate) });
        if (result.success) {
            toast.success("Date updated", { id: toastId });
        } else {
            toast.error(result.error || "Something went wrong", { id: toastId });
        }
    }

    const handleRatingChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRating = parseInt(e.target.value);
        setPersonalRating(newRating);
        const toastId = toast.loading("Saving rating...");
        const result = await updateMediaDetailsAction(series.id, 'tv', { userRating: newRating });
        if (result.success) {
            toast.success("Rating updated", { id: toastId });
        } else {
            toast.error(result.error || "Something went wrong", { id: toastId });
        }
    }

    useEffect(() => {
        const currentNote = note.trim();
        const savedNote = initialDbState?.userComment || '';

        const timer = setTimeout(async () => {
            if (initialDbState?.isWatched && currentNote !== savedNote) {

                const toastId = toast.loading("Saving comment...");

                const result = await updateMediaDetailsAction(series.id, 'tv', {
                    userComment: currentNote
                });

                if (result.success) {
                    toast.success("Comment updated", { id: toastId });
                } else {
                    toast.error(result.error || "Something went wrong", { id: toastId });
                }
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [note, series.id, initialDbState]);

    const handleSaveNote = async () => {
        setEditNote(false);
        const toastId = toast.loading("Saving comment...");

        const result = await updateMediaDetailsAction(series.id, 'tv', {
            userComment: note
        });

        if (result.success) {
            toast.success("Comment updated", { id: toastId });
        } else {
            toast.error(result.error || "Something went wrong", { id: toastId });
        }
    }

    const trailer = series.videos?.results.find(v => v.type === 'Trailer') || series.videos?.results[0]



    const creators = series.created_by || []
    const execProducers = credits.crew.filter(
        (c): c is CrewMember => c.job === 'Executive Producer' || c.job === 'Creator'
    );

    const mainTvCrewMap: Record<number, MainTvCrewItem> = {};

    creators.forEach((c) => {
        mainTvCrewMap[c.id] = {
            id: c.id,
            name: c.name,
            jobs: ['Creator']
        };
    });

    execProducers.forEach((c) => {
        if (!mainTvCrewMap[c.id]) {
            mainTvCrewMap[c.id] = {
                id: c.id,
                name: c.name,
                jobs: [c.job]
            };
        } else if (!mainTvCrewMap[c.id].jobs.includes(c.job)) {
            mainTvCrewMap[c.id].jobs.push(c.job);
        }
    });

    const mainTvCrew = Object.values(mainTvCrewMap);


    return (
        <div className='flex-1 relative bg-black text-white min-h-screen'>
            {/* Backdrop Section */}
            <div className='absolute inset-0 h-[35vh] sm:h-[45vh] lg:h-screen w-full overflow-hidden pointer-events-none'>
                <AnimatePresence>
                    {imageLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-zinc-900/90 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-full border-4 border-white/10 border-t-white/90 animate-spin shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
                                    <div className="absolute inset-0 blur-lg bg-white/5 rounded-full" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 animate-pulse">
                                    Loading Poster
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <Image
                    src={series.backdrop_path ? `https://image.tmdb.org/t/p/original${series.backdrop_path}` : '/back.jpg'}
                    alt={series.name || 'Backdrop'}
                    fill
                    sizes='100vw'
                    priority
                    className='object-cover opacity-40 select-none'
                    onLoad={() => setImageLoading(false)}
                />
                <div className='absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/20 lg:from-[#010101]' />
                <div className='absolute inset-0 bg-linear-to-r from-black via-transparent to-transparent lg:from-black/80' />
            </div>

            {/* Main Content Area */}
            <div className='relative z-10 pt-40 pb-10 sm:pb-20 px-4 sm:px-8 md:px-12 lg:px-20 mx-auto'>
                <div className='flex flex-col mx-auto lg:flex-row gap-8 lg:gap-16'>
                    {/* Poster Layer */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className='hidden lg:block shrink-0 w-[300px] xl:w-[360px]'
                    >
                        <div className='relative bg-zinc-900 aspect-2/3 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10'>
                            <Image
                                src={series.poster_path ? `https://image.tmdb.org/t/p/w500${series.poster_path}` : '/no-poster.png'}
                                alt={series.name || 'Poster'}
                                fill
                                sizes="(max-width: 1024px) 0vw, 360px"
                                className='object-cover'
                                priority
                            />
                        </div>
                    </motion.div>

                    <div className='max-w-3xl flex flex-col gap-8 flex-1'>
                        {/* Basic Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className='space-y-3'
                        >
                            <h1 className='text-5xl sm:text-7xl font-bold leading-[0.9] drop-shadow-2xl text-mdnichrome'>{series.name}</h1>

                            <div className='flex mt-7 flex-wrap items-center gap-4 text-sm sm:text-base font-semibold text-zinc-400'>
                                {series.vote_average !== 0 && (
                                    <>
                                        <div className='flex items-center gap-1.5 text-zinc-100'>
                                            <Star className='w-4 h-4 fill-amber-400 text-amber-400' />
                                            <span>{series.vote_average ? series.vote_average.toFixed(1) : 'N/A'}</span>
                                        </div>
                                    </>
                                )}

                                {series.origin_country && series.origin_country.length > 0 && (
                                    <>
                                        <div className='flex items-center gap-1.5 text-zinc-300'>
                                            <Globe className='w-4 h-4' />
                                            <span>{series.origin_country.join(', ')}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className='flex items-center gap-1.5 text-sm sm:text-base font-semibold text-zinc-300'>
                                <List className='w-4 h-4' />
                                <span>{series.number_of_seasons} {series.number_of_seasons !== 1 ? t('common', 'seasons') : t('common', 'season')} • {series.number_of_episodes} {series.number_of_episodes !== 1 ? t('common', 'episodes') : t('common', 'episode')}</span>
                            </div>
                            <div className='flex flex-wrap items-center gap-4 text-sm sm:text-base font-semibold text-zinc-400'>
                                <div className='flex items-center gap-1.5 text-zinc-300'>
                                    <Calendar className='w-4 h-4' />
                                    <span
                                        onClick={() => setShowFullDate(!showFullDate)}
                                        className="cursor-pointer select-none hover:text-white transition-colors"
                                        title="Click to toggle full date"
                                    >
                                        {series.first_air_date ? (
                                            showFullDate
                                                ? series.first_air_date.split('-').reverse().join('-')
                                                : series.first_air_date.split('-')[0]
                                        ) : 'Unknown'}

                                        {(series.status === 'Ended' || series.status === 'Canceled') && series.last_air_date ? (
                                            showFullDate
                                                ? ` – ${series.last_air_date.split('-').reverse().join('-')}`
                                                : ` – ${series.last_air_date.split('-')[0]}`
                                        ) : (
                                            !series.last_air_date && series.status !== 'Ended' ? ' – Present' : ''
                                        )}
                                    </span>
                                </div>

                                <div className='flex items-center gap-1.5 text-zinc-300'>
                                    <Info className='w-4 h-4' />
                                    <span>{series.status}</span>
                                </div>
                            </div>

                            {/* Genres */}
                            <div className='flex flex-wrap gap-2'>
                                {series.genres?.map((g) => (
                                    <span key={g.id} className='px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md text-zinc-400'>
                                        {g.name}
                                    </span>
                                ))}
                            </div>

                            {series.tagline && (
                                <p className='text-xl italic mt-5 text-zinc-500 bg-zinc-900/10 backdrop-blur-xl border border-white/5 rounded-lg px-2 w-fit font-medium'>
                                    "{series.tagline}"
                                </p>
                            )}

                            <motion.div layout className="max-w-2xl mt-5">
                                <motion.p
                                    layout
                                    className={`text-zinc-300 leading-relaxed text-lg font-medium ${!isOverviewExpanded ? 'line-clamp-4' : ''}`}
                                >
                                    {series.overview}
                                </motion.p>
                                {series.overview && series.overview.length > 280 && (
                                    <motion.button
                                        layout
                                        onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                                        className='text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors text-left w-fit mt-2 cursor-pointer'
                                    >
                                        {isOverviewExpanded ? t('common', 'showLess') : t('common', 'readMore')}
                                    </motion.button>
                                )}
                            </motion.div>
                        </motion.div>

                        {trailer && (
                            <button
                                onClick={() => setIsVideoOpen(true)}
                                className="flex w-fit items-center gap-2 bg-white text-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
                            >
                                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                                <span className="text-sm sm:text-base">Play Trailer</span>
                            </button>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-4">
                            <LibraryControlsButtons
                                mediaId={series.id}
                                mediaData={{
                                    title: series.name,
                                    poster: series.poster_path,
                                    rating: series.vote_average,
                                    year: series.first_air_date,
                                    description: series.overview
                                }}
                                type="tv"
                                userId={userId}
                                initialState={initialDbState || {}}
                            />
                        </div>

                        {/* Watched Panel (Date & Rating) */}
                        {initialDbState?.isWatched && (
                            <div

                                className='bg-zinc-900/10 backdrop-blur-xl border border-white/5 rounded-xl p-3.5 shadow-2xl space-y-4 max-w-[220px]'
                            >
                                <div className='flex justify-between'>
                                    <div className='flex flex-col gap-1'>
                                        <label className='text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700'>{t('common', 'watchedOn')}</label>
                                        <input
                                            type='date'
                                            value={watchDate}
                                            onChange={handleDateChange}
                                            className='w-fit bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-white/20 transition-colors text-white text-[11px] font-bold cursor-pointer'
                                        />
                                    </div>

                                    <div className='flex flex-col gap-1'>
                                        <label className='text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700'>{t('common', 'rating')}</label>
                                        <div className='relative w-fit'>
                                            <select
                                                value={personalRating}
                                                onChange={handleRatingChange}
                                                className='w-fit bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-white/20 transition-colors text-white text-[11px] font-bold appearance-none cursor-pointer pr-8'
                                            >
                                                {[...Array(10)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1} className='bg-zinc-950 text-white'>
                                                        {i + 1}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className='absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600'>
                                                <ChevronRight className='w-3 h-3 rotate-90' />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}




                        {/* Credits Summary */}
                        {mainTvCrew.length > 0 && (() => {
                            const displayedCrew = isCreatorsExpanded ? mainTvCrew : mainTvCrew.slice(0, 3)

                            return (
                                <div className='mt-4'>
                                    <h3 className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6'>{t('common', 'creators')}</h3>
                                    <motion.div layout className='flex flex-col gap-3'>
                                        <motion.div layout className='flex flex-wrap gap-x-12 gap-y-6'>
                                            <AnimatePresence mode='popLayout'>
                                                {displayedCrew.map((person) => (
                                                    <div key={person.id} className='flex flex-col gap-1'>
                                                        <Link href={`/person/${person.id}`}>
                                                            <motion.span
                                                                layout
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.9 }}
                                                                transition={{ duration: 0.2 }}
                                                                className='text-xl sm:text-2xl font-bold hover:text-white transition-colors cursor-pointer text-left text-zinc-300 origin-left inline-block'
                                                            >
                                                                {person.name}
                                                            </motion.span>
                                                        </Link>
                                                        <span className='text-[10px] font-black uppercase tracking-widest text-zinc-600'>
                                                            {person.jobs.map((job) => t('common', job.toLocaleLowerCase())).join(' / ')}
                                                        </span>
                                                    </div>
                                                ))}
                                            </AnimatePresence>
                                        </motion.div>
                                        {mainTvCrew.length > 3 && (
                                            <motion.button
                                                layout
                                                onClick={() => setIsCreatorsExpanded(!isCreatorsExpanded)}
                                                className='text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors text-left w-fit mt-1 cursor-pointer'
                                            >
                                                {isCreatorsExpanded ? 'Show Less' : `+ ${mainTvCrew.length - 3} More`}
                                            </motion.button>
                                        )}
                                    </motion.div>
                                </div>
                            )
                        })()}
                    </div>
                </div>

                <hr className='border-white/10 my-12' />

                {/* Cast Carousel */}
                <DetailCarousel type='cast' items={credits.cast.slice(0, 100)} mediaType='tv' />

                {/* Note Section (Between Cast and Similar) */}
                <AnimatePresence>
                    {initialDbState?.isWatched && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className='mt-20 max-w-4xl'
                        >
                            <h2 className='text-4xl font-bold mb-2'>{t('common', 'myCommentary')}</h2>
                            <p className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 mb-6'>{t('common', 'personalNotes')}</p>
                            {initialDbState?.userComment !== '' && initialDbState?.userComment !== null ?
                                (!editNote && <>
                                    <p className='text-lg sm:text-xl font-medium text-zinc-300'>{note || initialDbState?.userComment}</p>
                                    <button onClick={() => setEditNote(true)} className='text-md mt-5 bg-white px-4 py-2 rounded-md sm:text-lg font-bold hover:bg-zinc-200 transition-colors cursor-pointer text-left text-black'>{t('common', 'editCommentary')}</button>
                                </>) :

                                !editNote && <button onClick={() => setEditNote(true)} className='text-xl bg-white px-4 py-2 rounded-md sm:text-xl font-bold hover:bg-zinc-200 transition-colors cursor-pointer text-left text-black'>{t('common', 'addCommentary')}</button>

                            }
                            {editNote &&
                                <div>
                                    <div className='bg-white/2 border border-white/5 rounded-3xl p-5 sm:p-8 shadow-3xl'>
                                        <textarea
                                            placeholder={t('common', 'commentaryPlaceholder')}
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className='w-full bg-transparent text-xl sm:text-2xl font-medium text-zinc-300 outline-none border-none resize-none min-h-[200px] placeholder:text-zinc-800'
                                        />
                                    </div>
                                    <button onClick={handleSaveNote} className='text-xl mt-10 bg-white px-4 py-2 rounded-md sm:text-xl font-bold hover:bg-zinc-200 transition-colors cursor-pointer text-left text-black'>{t('common', 'saveCommentary')}</button>
                                </div>
                            }
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Similar Series */}
                <DetailCarousel type='similar' items={similarSeries} mediaType='tv' />
            </div>

            <VideoModal
                isOpen={isVideoOpen}
                onClose={() => setIsVideoOpen(false)}
                videoKey={trailer?.key || null}
            />

            <style jsx>{`
				.text-mdnichrome {
					font-family: var(--font-nichrome), serif;
				}
				@font-face {
					font-family: 'MD Nichrome';
					src: url('/fonts/MDNichrome-Bold.woff2') format('woff2');
					font-weight: bold;
					font-style: normal;
				}
			`}</style>
        </div>
    )
}