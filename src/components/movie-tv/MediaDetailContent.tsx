'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { LocalizedLink as Link } from '@/components/navigation/Link';
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Calendar, ChevronRight, ChevronDown, Globe, Play, List, Info } from 'lucide-react'
import VideoModal from '../ui/VideoModal'
import LibraryControlsButtons from '@/components/ui/LibraryControlsButtons'
import DetailCarousel from '../ui/DetailCarousel'
import { updateMediaDetailsAction } from '@/lib/actions/updateMediaDetailsAction'
import { toast } from "sonner"
import { useTranslation } from '@/providers/LocaleProvider'
import { getLocalizedUrl } from '@/lib/i18n/url-utils'
import { MovieDetailProps, TvSeriesDetailProps, CrewMember } from '@/lib/tmdb/types/tmdb-types'
import { dbState } from '@/lib/tmdb/types/db-types'
import { ExpandableMarkdown } from '@/components/ui/UserNote'
import ShareButton from '@/components/ui/ShareButton'
import Loader from '@/components/ui/Loader'
import StarRating from '@/components/ui/StarRating'
import MediaDetailSkeleton from './MediaDetailSkeleton'

interface Props {
    data: (MovieDetailProps | TvSeriesDetailProps) & { initialDbState?: dbState };
    userId: string;
    type: 'movie' | 'tv';
}

interface MainCrewItem {
    id: number;
    name: string;
    jobs: string[];
}

export default function MediaDetailContent({ data, userId, type }: Props) {
    const { t, locale } = useTranslation();
    const [imageLoading, setImageLoading] = useState(true);
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [editNote, setEditNote] = useState(false);
    const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
    const [canExpand, setCanExpand] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    // TV-specific state
    const [showSeasons, setShowSeasons] = useState(false);
    const [showFullDate, setShowFullDate] = useState(false);
    const [isCreatorsExpanded, setIsCreatorsExpanded] = useState(false);
    const [showScrollIndicator, setShowScrollIndicator] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setShowScrollIndicator(false);
            } else {
                setShowScrollIndicator(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Common data mapping
    const isMovie = type === 'movie';
    const movieData = isMovie ? (data as MovieDetailProps) : null;
    const tvData = !isMovie ? (data as TvSeriesDetailProps) : null;

    const media = isMovie ? movieData!.movie : tvData!.series;
    const credits = data.credits;
    const similarItems = isMovie ? movieData!.similarMovies : tvData!.similarSeries;
    const initialDbState = data.initialDbState;

    const title = isMovie ? movieData!.movie.title : tvData!.series.name;
    const releaseDate = isMovie ? movieData!.movie.release_date : tvData!.series.first_air_date;

    const [watchDate, setWatchDate] = useState(
        initialDbState?.watchedDate
            ? new Date(initialDbState.watchedDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    )
    const [personalRating, setPersonalRating] = useState(initialDbState?.userRating || 0)
    const [note, setNote] = useState(initialDbState?.userComment || '')

    useEffect(() => {
        const checkTruncation = () => {
            if (textRef.current) {
                const isTruncated = textRef.current.scrollHeight > textRef.current.clientHeight;
                setCanExpand(isTruncated);
            }
        };

        checkTruncation();
        window.addEventListener('resize', checkTruncation);
        return () => window.removeEventListener('resize', checkTruncation);
    }, [media?.overview]);

    const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setWatchDate(newDate);
        const toastId = toast.loading(t('common', 'savingDate'));
        const result = await updateMediaDetailsAction(media.id, type, { watchedDate: new Date(newDate) });
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
        const result = await updateMediaDetailsAction(media.id, type, { userRating: newRating });
        if (result.success) {
            toast.success(t('common', 'ratingUpdated'), { id: toastId });
        } else {
            toast.error(result.error || "Something went wrong", { id: toastId });
        }
    }

    const handleSaveNote = async () => {
        setEditNote(false);
        const toastId = toast.loading(t('common', 'savingComment'));

        const result = await updateMediaDetailsAction(media.id, type, {
            userComment: note
        });

        if (result.success) {
            toast.success(t('common', 'commentUpdated'), { id: toastId });
        } else {
            toast.error(result.error || "Something went wrong", { id: toastId });
        }
    }

    const trailer = media.videos?.results.find(v => v.type === 'Trailer') || media.videos?.results[0]

    // Crew processing
    const mainCrewMap: Record<number, MainCrewItem> = {}
    if (isMovie) {
        credits.crew.forEach(c => {
            if (c.job === 'Director' || c.job === 'Writer' || c.job === 'Screenplay') {
                if (!mainCrewMap[c.id]) {
                    mainCrewMap[c.id] = { id: c.id, name: c.name, jobs: [c.job] }
                } else if (!mainCrewMap[c.id].jobs.includes(c.job)) {
                    mainCrewMap[c.id].jobs.push(c.job)
                }
            }
        })
    } else {
        const creators = tvData!.series.created_by || []
        const execProducers = credits.crew.filter(
            (c): c is CrewMember => c.job === 'Executive Producer' || c.job === 'Creator'
        );

        creators.forEach((c) => {
            mainCrewMap[c.id] = { id: c.id, name: c.name, jobs: ['Creator'] };
        });

        execProducers.forEach((c) => {
            if (!mainCrewMap[c.id]) {
                mainCrewMap[c.id] = { id: c.id, name: c.name, jobs: [c.job] };
            } else if (!mainCrewMap[c.id].jobs.includes(c.job)) {
                mainCrewMap[c.id].jobs.push(c.job);
            }
        });
    }
    const mainCrew = Object.values(mainCrewMap)

    const formatRuntime = (minutes: number) => {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        return `${h}${t('common', 'hour')} ${m}${t('common', 'minute')}`
    }

    const realSeasons = tvData?.series?.seasons?.filter((s) => s.season_number > 0) || [];

    if (!media) return <MediaDetailSkeleton />

    return (
        <div className='flex-1 relative bg-black text-white min-h-screen'>
            <div className='absolute inset-0 h-[40vh] lg:h-screen w-full overflow-hidden pointer-events-none'>
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
                    src={media.backdrop_path ? `https://image.tmdb.org/t/p/original${media.backdrop_path}` : '/back.jpg'}
                    alt={title || 'Backdrop'}
                    fill
                    sizes='100vw'
                    priority
                    className={`object-cover select-none}`}
                    onLoad={() => setImageLoading(false)}
                />
                <div className={`absolute inset-0 ${isMovie
                    ? 'bg-linear-to-t from-black via-black/60 to-transparent'
                    : 'bg-linear-to-t from-black via-black/40 to-black/20 lg:from-[#010101]'
                    }`} />
                {!isMovie && <div className='absolute inset-0 bg-linear-to-r from-black via-transparent to-transparent lg:from-black/80' />}
            </div>

            {/* Main Content Area */}
            <div className='relative z-10 pt-[25vh] lg:pt-[65vh] pb-20 px-4 sm:px-8 md:px-12 lg:px-20 mx-auto'>
                <div className='flex flex-col gap-8 lg:gap-16'>

                    <div className='max-w-3xl flex flex-col gap-8 flex-1'>
                        {/* Basic Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className='space-y-6'
                        >
                            <h1 className='text-3xl sm:text-7xl font-bold leading-[0.9] drop-shadow-2xl text-mdnichrome'>{title}</h1>

                            <div className='flex flex-wrap items-center gap-4 text-sm sm:text-base font-semibold text-zinc-400'>
                                {media.vote_average !== 0 && (
                                    <>
                                        <StarRating text={`${media.vote_average?.toFixed(1)}`} ratingType="tmdb" />
                                        <span className='text-zinc-800'>|</span>
                                    </>
                                )}

                                {isMovie ? (
                                    <>
                                        {releaseDate && (
                                            <div className='flex items-center gap-1.5 text-zinc-300'>
                                                <Calendar className='w-4 h-4' />
                                                <span>{releaseDate.split('-').reverse().join('.')}</span>
                                            </div>
                                        )}
                                        {movieData?.movie.production_countries && movieData.movie.production_countries.length > 0 && (
                                            <>
                                                <span className='text-zinc-800'>|</span>
                                                <div className='flex items-center gap-1.5 text-zinc-300'>
                                                    <Globe className='w-4 h-4' />
                                                    <span>{movieData.movie.production_countries.map(c => c.iso_3166_1).join(', ')}</span>
                                                </div>
                                            </>
                                        )}
                                        {movieData?.movie.runtime !== 0 && (
                                            <>
                                                <span className='text-zinc-800'>|</span>
                                                <div className='flex items-center gap-1.5 text-zinc-300'>
                                                    <Clock className='w-4 h-4' />
                                                    <span>{formatRuntime(movieData!.movie.runtime)}</span>
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {tvData?.series.origin_country && tvData.series.origin_country.length > 0 && (
                                            <div className='flex items-center gap-1.5 text-zinc-300'>
                                                <Globe className='w-4 h-4' />
                                                <span>{tvData.series.origin_country.join(', ')}</span>
                                            </div>
                                        )}
                                        <span className='text-zinc-800'>|</span>
                                        <div className='flex items-center gap-1.5 text-zinc-300'>
                                            <Calendar className='w-4 h-4' />
                                            <span
                                                onClick={() => setShowFullDate(!showFullDate)}
                                                className="cursor-pointer select-none hover:text-white transition-colors"
                                            >
                                                {releaseDate ? (
                                                    showFullDate
                                                        ? releaseDate.split('-').reverse().join('.')
                                                        : releaseDate.split('-')[0]
                                                ) : 'Unknown'}

                                                {(tvData?.series.status === 'Ended' || tvData?.series.status === 'Canceled') && tvData?.series.last_air_date ? (
                                                    showFullDate
                                                        ? ` – ${tvData.series.last_air_date.split('-').reverse().join('.')}`
                                                        : ` – ${tvData.series.last_air_date.split('-')[0]}`
                                                ) : (
                                                    !tvData?.series.last_air_date && tvData?.series.status !== 'Ended' ? ' – Present' : ''
                                                )}
                                            </span>
                                        </div>
                                        <span className='text-zinc-800'>|</span>
                                        <div className='flex items-center gap-1.5 text-zinc-300'>
                                            <Info className='w-4 h-4' />
                                            <span>{t('common', tvData?.series.status?.split(' ').join('') as string)}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {!isMovie && (
                                <>
                                    <div
                                        onClick={() => setShowSeasons(!showSeasons)}
                                        className='flex items-center gap-1.5 text-sm sm:text-base font-semibold text-zinc-300 cursor-pointer hover:text-white transition-colors w-fit group'
                                    >
                                        <List className='w-4 h-4' />
                                        <span>{tvData?.series.number_of_seasons} {tvData?.series.number_of_seasons !== 1 ? t('common', 'seasons') : t('common', 'season')} • {tvData?.series.number_of_episodes} {tvData?.series.number_of_episodes !== 1 ? t('common', 'episodes') : t('common', 'episode')}</span>
                                        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showSeasons ? 'rotate-90' : ''}`} />
                                    </div>

                                    <AnimatePresence>
                                        {showSeasons && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                className="overflow-hidden"
                                            >
                                                <div className="flex flex-col gap-3 py-2">
                                                    {realSeasons.map((season) => (
                                                        <div key={season.id} className="group/item w-fit flex flex-col gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-zinc-200 font-bold text-base sm:text-md">{season.name}</span>
                                                                <span className="text-zinc-500 text-xs font-black uppercase tracking-widest bg-black/40 px-2 py-1 rounded-md">
                                                                    {season.episode_count} {season.episode_count !== 1 ? t('common', 'episodes') : t('common', 'episode')}
                                                                </span>
                                                            </div>
                                                            {season.air_date && (
                                                                <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold">
                                                                    <Calendar className="w-3 h-3" />
                                                                    <span>{season.air_date.split('-').reverse().join('.')}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}

                            {/* Genres */}
                            <div className='flex flex-wrap gap-2'>
                                {media.genres?.map((g) => (
                                    <span key={g.id} className='px-3 py-1 hover:text-white hover:bg-white/10 cursor-pointer bg-white/5 border border-white/10 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md text-zinc-400'>
                                        <Link href={`/${isMovie ? 'movies' : 'tvseries'}?category=genres&genreId=${g.id}`}>
                                            {g.name}
                                        </Link>
                                    </span>
                                ))}
                            </div>

                            <ShareButton
                                title={title}
                                buttonText={t('common', 'share')}
                                currentUrl={getLocalizedUrl(`/${isMovie ? 'movies' : 'tvseries'}/${media.id}`, locale)} />

                            {media.tagline && (
                                <p className={`text-lg sm:text-xl italic font-medium ${isMovie ? 'text-zinc-500' : 'text-zinc-500 bg-zinc-900/10 backdrop-blur-xl border border-white/5 rounded-lg px-2 w-fit'}`}>
                                    "{media.tagline}"
                                </p>
                            )}

                            <motion.div layout className="max-w-4xl">
                                <p
                                    ref={textRef}
                                    className={`text-zinc-300 leading-relaxed text-lg font-medium ${!isOverviewExpanded ? 'line-clamp-3' : ''
                                        }`}
                                    style={{
                                        display: '-webkit-box',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: isOverviewExpanded ? 'unset' : 3,
                                        overflow: 'hidden'
                                    }}
                                >
                                    {media.overview}
                                </p>

                                {(canExpand || isOverviewExpanded || (!isMovie && media.overview && media.overview.length > 100)) && (
                                    <button
                                        onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                                        className='text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors text-left w-fit mt-2 cursor-pointer'
                                    >
                                        {isOverviewExpanded ? t('common', 'showLess') : t('common', 'readMore')}
                                    </button>
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
                                mediaId={media.id}
                                mediaData={{
                                    titleEn: title,
                                    posterEn: media.poster_path,
                                    tmdbRating: media.vote_average,
                                    releaseDate: releaseDate,
                                    genreIds: media.genres?.map(g => g.id).join(',')
                                }}
                                type={type}
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
                                {isMovie ? (
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
                                ) : (
                                    (() => {
                                        const displayedCrew = isCreatorsExpanded ? mainCrew : mainCrew.slice(0, 3)
                                        return (
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
                                                {mainCrew.length > 3 && (
                                                    <motion.button
                                                        layout
                                                        onClick={() => setIsCreatorsExpanded(!isCreatorsExpanded)}
                                                        className='text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors text-left w-fit mt-1 cursor-pointer'
                                                    >
                                                        {isCreatorsExpanded ? t('common', 'showLess') : `+ ${mainCrew.length - 3} ${t('common', 'more')}`}
                                                    </motion.button>
                                                )}
                                            </motion.div>
                                        )
                                    })()
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <hr className='border-white/10 my-12' />

                {/* Cast Carousel */}
                <DetailCarousel type='cast' items={isMovie ? credits.cast : credits.cast.slice(0, 100)} mediaType={type} />

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
                                    <button onClick={() => setEditNote(true)} className='text-md mt-5 bg-white text-black px-4 py-2 rounded-md sm:text-lg font-bold hover:bg-zinc-200 transition-colors cursor-pointer text-left'>{t('common', 'editCommentary')}</button>
                                </>) :

                                !editNote && <button onClick={() => setEditNote(true)} className='text-xl bg-white text-black px-4 py-2 rounded-md sm:text-xl font-bold hover:bg-zinc-200 transition-colors cursor-pointer text-left'>{t('common', 'addCommentary')}</button>

                            }
                            {editNote &&
                                <div>
                                    <div className='bg-white/2 border border-white/5 rounded-3xl p-5 sm:p-8 shadow-3xl'>
                                        <textarea
                                            placeholder={isMovie ? 'Write your thoughts about the movie here...' : t('common', 'commentaryPlaceholder')}
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className='w-full bg-transparent text-xl sm:text-2xl font-medium text-zinc-300 outline-none border-none resize-none min-h-[200px] placeholder:text-zinc-800'
                                        />
                                    </div>
                                    <button onClick={handleSaveNote} className='text-xl mt-10 bg-white text-black px-4 py-2 rounded-md sm:text-xl font-bold hover:bg-zinc-200 transition-colors cursor-pointer text-left'>{t('common', 'saveCommentary')}</button>
                                </div>
                            }
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Similar Items */}
                <DetailCarousel type='similar' items={similarItems} mediaType={type} />
            </div>

            <VideoModal
                isOpen={isVideoOpen}
                onClose={() => setIsVideoOpen(false)}
                videoKey={trailer?.key || null}
            />

            <AnimatePresence>
                {showScrollIndicator && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:fixed bottom-8 right-6 sm:right-12 z-50 flex flex-col items-center gap-3 pointer-events-none"
                    >
                        <motion.div
                            animate={{
                                y: [0, 8, 0],
                                opacity: [0.4, 1, 0.4],
                                scale: [0.95, 1.05, 0.95]
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-13 h-13 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                <ChevronDown className="w-7 h-7 text-white/80" />
                            </div>
                            <div className="w-px h-[30vh] bg-linear-to-b from-white/20 to-transparent mt-2" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
