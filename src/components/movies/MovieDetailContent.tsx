'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { LocalizedLink as Link } from '@/components/navigation/Link';
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Calendar, ChevronRight, Globe, Play } from 'lucide-react'
import VideoModal from '../ui/VideoModal'
import LibraryControlsButtons from '@/components/ui/LibraryControlsButtons'
import DetailCarousel from '../ui/DetailCarousel'
import { updateMediaDetailsAction } from '@/lib/actions/updateMediaDetailsAction'
import { toast } from "sonner"
import { useTranslation } from '@/providers/LocaleProvider'
import { getLocalizedUrl } from '@/lib/i18n/url-utils'
import { MovieDetailProps } from '@/lib/tmdb/types/tmdb-types'
import { dbState } from '@/lib/tmdb/types/db-types'
import { ExpandableMarkdown } from '@/components/ui/UserNote'
import ShareButton from '@/components/ui/ShareButton'
import Loader from '@/components/ui/Loader'
import StarRating from '@/components/ui/StarRating'


interface Props {
    data: MovieDetailProps & { initialDbState?: dbState };
    userId: string;
}

export default function MovieDetailContent({ data, userId }: Props) {
    const { t, locale } = useTranslation();
    const [imageLoading, setImageLoading] = useState(true);
    const { movie, credits, similarMovies, initialDbState } = data;

    const [watchDate, setWatchDate] = useState(
        initialDbState?.watchedDate
            ? new Date(initialDbState.watchedDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    )
    const [personalRating, setPersonalRating] = useState(initialDbState?.userRating || 0)
    const [note, setNote] = useState(initialDbState?.userComment || '')
    const [isOverviewExpanded, setIsOverviewExpanded] = useState(false)
    const [isVideoOpen, setIsVideoOpen] = useState(false)
    const [editNote, setEditNote] = useState(false)

    const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setWatchDate(newDate);
        const toastId = toast.loading(t('common', 'savingDate'));
        const result = await updateMediaDetailsAction(movie.id, 'movie', { watchedDate: new Date(newDate) });
        if (result.success) {
            toast.success(t('common', 'dateUpdated'), { id: toastId });
        } else {
            toast.error(result.error || "Something went wrong", { id: toastId });
        }
    }

    const handleRatingChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRating = parseInt(e.target.value);
        setPersonalRating(newRating);
        const toastId = toast.loading(t('common', 'savingRating'));
        const result = await updateMediaDetailsAction(movie.id, 'movie', { userRating: newRating });
        if (result.success) {
            toast.success(t('common', 'ratingUpdated'), { id: toastId });
        } else {
            toast.error(result.error || "Something went wrong", { id: toastId });
        }
    }

    // useEffect(() => {
    //     if (!movie.id) return;

    //     const currentNote = note.trim();
    //     const savedNote = initialDbState?.userComment || '';

    //     const timer = setTimeout(async () => {
    //         if (initialDbState?.isWatched && currentNote !== savedNote) {

    //             const toastId = toast.loading(t('common', 'savingComment'));

    //             const result = await updateMediaDetailsAction(movie.id, 'movie', {
    //                 userComment: currentNote
    //             });

    //             if (result.success) {
    //                 toast.success(t('common', 'commentUpdated'), { id: toastId });
    //             } else {
    //                 toast.error(result.error || "Something went wrong", { id: toastId });
    //             }
    //         }
    //     }, 1000);

    //     return () => clearTimeout(timer);
    // }, [note, movie.id, initialDbState]);

    const handleSaveNote = async () => {
        setEditNote(false);
        const toastId = toast.loading(t('common', 'savingComment'));

        const result = await updateMediaDetailsAction(movie.id, 'movie', {
            userComment: note
        });

        if (result.success) {
            toast.success(t('common', 'commentUpdated'), { id: toastId });
        } else {
            toast.error(result.error || "Something went wrong", { id: toastId });
        }
    }

    const trailer = movie.videos?.results.find(v => v.type === 'Trailer') || movie.videos?.results[0]

    const mainCrewMap: Record<number, { name: string, jobs: string[], id: number }> = {}
    credits.crew.forEach(c => {
        if (c.job === 'Director' || c.job === 'Writer' || c.job === 'Screenplay') {
            if (!mainCrewMap[c.id]) {
                mainCrewMap[c.id] = { id: c.id, name: c.name, jobs: [c.job] }
            } else if (!mainCrewMap[c.id].jobs.includes(c.job)) {
                mainCrewMap[c.id].jobs.push(c.job)
            }
        }
    })
    const mainCrew = Object.values(mainCrewMap)

    const formatRuntime = (minutes: number) => {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        return `${h}${t('common', 'hour')} ${m}${t('common', 'minute')}`
    }

    if (!movie) return <Loader />

    return (
        <div className='flex-1 relative bg-black text-white min-h-screen'>
            <div className='absolute inset-0 h-[35vh] sm:h-[45vh] lg:h-screen w-full overflow-hidden pointer-events-none'>
                {/* Backdrop Section */}
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
                    src={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '/back.jpg'}
                    alt={movie.title}
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
            <div className='relative z-10 pt-40 pb-20 px-4 sm:px-8 md:px-12 lg:px-20 mx-auto'>
                <div className='flex flex-col lg:flex-row gap-8 lg:gap-16'>
                    {/* Poster Layer */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className='hidden lg:block shrink-0 w-[300px] xl:w-[360px]'
                    >
                        <div className='relative bg-zinc-900 aspect-2/3 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10'>
                            <Image
                                src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-poster.png'}
                                alt={movie.title || 'Poster'}
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
                            className='space-y-6'
                        >
                            <h1 className='text-5xl sm:text-7xl font-bold leading-[0.9] drop-shadow-2xl text-mdnichrome'>{movie.title}</h1>

                            <div className='flex flex-wrap items-center gap-4 text-sm sm:text-base font-semibold text-zinc-400'>
                                {movie.vote_average !== 0 && (
                                    <>
                                        <StarRating text={`${movie.vote_average?.toFixed(1)}`} ratingType="tmdb" />
                                        <span className='text-zinc-800'>|</span>
                                    </>
                                )}
                                {movie.release_date && (
                                    <div className='flex items-center gap-1.5 text-zinc-300'>
                                        <Calendar className='w-4 h-4' />
                                        <span>{movie.release_date.split('-').reverse().join('.')}</span>
                                    </div>
                                )}
                                {movie.production_countries && movie.production_countries.length > 0 && (
                                    <>
                                        <span className='text-zinc-800'>|</span>
                                        <div className='flex items-center gap-1.5 text-zinc-300'>
                                            <Globe className='w-4 h-4' />
                                            <span>{movie.production_countries.map(c => c.iso_3166_1).join(', ')}</span>
                                        </div>
                                    </>
                                )}
                                {movie.runtime !== 0 && (
                                    <>
                                        <span className='text-zinc-800'>|</span>
                                        <div className='flex items-center gap-1.5 text-zinc-300'>
                                            <Clock className='w-4 h-4' />
                                            <span>{formatRuntime(movie.runtime)}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Genres */}
                            <div className='flex flex-wrap gap-2'>
                                {movie.genres.map((g) => (
                                    <span key={g.id} className='px-3 py-1 hover:text-white hover:bg-white/10 cursor-pointer bg-white/5 border border-white/10 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md text-zinc-400'>
                                        <Link href={`/movies?category=genres&genreId=${g.id}`}>
                                            {g.name}
                                        </Link>
                                    </span>
                                ))}
                            </div>

                            <ShareButton
                                title={movie.title}
                                buttonText={t('common', 'share')}
                                currentUrl={getLocalizedUrl(`/movies/${movie.id}`, locale)} />

                            {movie.tagline && (
                                <p className='text-xl italic text-zinc-500 font-medium'>
                                    "{movie.tagline}"
                                </p>
                            )}

                            <motion.div layout className="max-w-2xl">
                                <motion.p
                                    layout
                                    className={`text-zinc-300 leading-relaxed text-lg font-medium ${!isOverviewExpanded ? 'line-clamp-3' : ''}`}
                                >
                                    {movie.overview}
                                </motion.p>
                                {movie.overview && movie.overview.length > 150 && (
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
                                <span className="text-sm sm:text-base">{t('common', 'playTrailer')}</span>
                            </button>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-4">
                            <LibraryControlsButtons
                                mediaId={movie.id}
                                mediaData={{
                                    titleEn: movie.title,
                                    posterEn: movie.poster_path,
                                    tmdbRating: movie.vote_average,
                                    releaseDate: movie.release_date,
                                    genreIds: movie.genres?.map(g => g.id).join(',')
                                }}
                                type="movie"
                                userId={userId}
                                initialState={initialDbState || {}}
                            />
                        </div>

                        {/* Watched Panel (Date & Rating) */}
                        <AnimatePresence mode="wait">
                            {initialDbState?.isWatched && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
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
                                </motion.div>
                            )}
                        </AnimatePresence>


                        {mainCrew.length > 0 && (
                            <div className='mt-4'>
                                <h3 className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6'>{t('common', 'creators')}</h3>
                                <div className='flex flex-wrap gap-x-12 gap-y-6'>
                                    {mainCrew.map((person) => (
                                        <div key={person.id} className='flex flex-col gap-1'>
                                            <Link href={`/person/${person.id}`} className='text-xl sm:text-2xl font-bold hover:text-white transition-colors cursor-pointer text-left text-zinc-300'>
                                                {person.name}
                                            </Link>
                                            <span className='text-[10px] font-black uppercase tracking-widest text-zinc-600'>
                                                {person.jobs.map((job) => t('common', job)).join(' / ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <hr className='border-white/10 my-12' />

                {/* Cast Carousel */}
                <DetailCarousel type='cast' items={credits.cast} mediaType='movie' />

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
                                    <ExpandableMarkdown content={note || initialDbState?.userComment || ''} t={t} />
                                    <button onClick={() => setEditNote(true)} className='text-md mt-5 bg-white px-4 py-2 rounded-md sm:text-lg font-bold hover:bg-zinc-200 transition-colors cursor-pointer text-left text-black'>{t('common', 'editCommentary')}</button>
                                </>) :

                                !editNote && <button onClick={() => setEditNote(true)} className='text-xl bg-white px-4 py-2 rounded-md sm:text-xl font-bold hover:bg-zinc-200 transition-colors cursor-pointer text-left text-black'>{t('common', 'addCommentary')}</button>

                            }
                            {editNote &&
                                <div>
                                    <div className='bg-white/2 border border-white/5 rounded-3xl p-5 sm:p-8 shadow-3xl'>
                                        <textarea
                                            placeholder='Write your thoughts about the movie here...'
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

                {/* Similar Movies */}
                <DetailCarousel type='similar' items={similarMovies} mediaType='movie' />
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