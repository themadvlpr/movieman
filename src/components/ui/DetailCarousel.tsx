import { Actor, CreditMedia, Movie, TvSeries } from "@/lib/tmdb/types/tmdb-types"
import Link from "next/link"
import Image from "next/image"
import { User, Star, Play } from "lucide-react"

interface DetailCarouselProps {
    type: 'cast' | 'similar' | 'person-credits'
    items: (Actor | Movie | TvSeries)[]
    mediaType: 'movie' | 'tv'
}

export default function DetailCarousel({ type, items, mediaType }: DetailCarouselProps) {
    let title = ''
    let subtitle = ''

    const uniqueItems = Array.from(new Map((items || []).map(item => [item.id, item])).values());

    if (type === 'cast') {
        title = 'Top Cast'
        subtitle = 'The actors and their roles'
    } else if (type === 'similar') {
        title = 'More Like This'
        subtitle = 'Recommendations for you'
    } else if (type === 'person-credits') {
        title = mediaType === 'movie' ? 'Known For (Movies)' : 'Known For (TV)'
        subtitle = mediaType === 'movie' ? 'Top rated films' : 'Top rated series'
    }

    if (!items || items.length === 0) return null


    return (
        <section className={'mt-15 sm:mt-20'}>
            <div className='flex justify-between items-end mb-10'>
                <div>
                    <h2 className='text-4xl font-bold mb-2'>{title}</h2>
                    <p className='text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]'>{subtitle}</p>
                </div>
            </div>
            <div className='flex gap-8 overflow-x-auto pb-10 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0'>
                {uniqueItems.map((item) => {
                    if (type === 'cast') {
                        const actor = item as Actor
                        const displayCharacter = actor.roles?.[0]?.character ?? actor.character ?? 'Unknown Role'

                        return (
                            <Link key={actor.id} href={`/person/${actor.id}`} className='w-36 shrink-0 group block'>
                                <div className='relative aspect-4/5 w-full cursor-pointer rounded-xl overflow-hidden mb-4 bg-zinc-900 ring-1 ring-white/5 group-hover:ring-white/20 transition-all duration-500 shadow-2xl'>
                                    {actor.profile_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w342${actor.profile_path}`}
                                            alt={actor.name || 'Actor'}
                                            fill
                                            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                                            className='object-cover object-[center_20%] cursor-pointer group-hover:scale-105 transition-all duration-700 ease-out'
                                        />
                                    ) : (
                                        <div className='w-full h-full flex items-center justify-center bg-zinc-800'>
                                            <User className='w-12 h-12 text-zinc-900 fill-zinc-700' />
                                        </div>
                                    )}
                                    <div className='absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60' />
                                </div>
                                <h4 className='font-bold text-white group-hover:text-white transition-colors truncate'>{actor.name}</h4>
                                <p className='text-[10px] text-zinc-600 font-bold uppercase tracking-wider truncate mt-1'>
                                    {displayCharacter}
                                </p>
                                {mediaType === 'tv' && actor.roles?.[0]?.episode_count && actor.roles?.[0]?.episode_count > 0 && (
                                    <p className='text-[10px] text-zinc-600 font-bold uppercase tracking-wider truncate mt-1'>
                                        {actor.roles[0].episode_count} episode{actor.roles[0].episode_count !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </Link>
                        )
                    } else {
                        const media = item as CreditMedia;
                        const id = media.id;

                        const isMovie = 'title' in media;

                        const mediaTitle = isMovie ? media.title : media.name;
                        const date = isMovie ? media.release_date : media.first_air_date;

                        const posterPath = media.poster_path;
                        const voteAverage = media.vote_average;
                        const year = date?.slice(0, 4) || 'Unknown';

                        const href = isMovie ? `/movies/${id}` : `/tvseries/${id}`;

                        const character = media.character;
                        const job = media.job;

                        return (
                            <Link key={id} href={href} className='w-48 shrink-0 group'>
                                <div className='relative aspect-2/3 rounded-2xl overflow-hidden mb-4 bg-zinc-900 ring-1 ring-white/5 group-hover:ring-white/20 transition-all duration-500 shadow-2xl'>
                                    {posterPath ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                                            alt={mediaTitle || 'Poster'}
                                            fill
                                            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                                            className='object-cover group-hover:scale-110 transition-transform duration-700 ease-out'
                                        />
                                    ) : (
                                        <div className='w-full h-full flex items-center justify-center text-zinc-700 text-[10px] font-bold'>NO POSTER</div>
                                    )}
                                    <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                                        <div className='w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20'>
                                            <Play className='w-6 h-6 fill-white ml-1' />
                                        </div>
                                    </div>
                                </div>
                                <h4 className='font-bold text-base text-zinc-300 group-hover:text-white transition-colors truncate uppercase tracking-tight'>{mediaTitle}</h4>
                                <div className='flex flex-col gap-1 mt-1.5'>
                                    <div className='flex items-center gap-3'>
                                        {voteAverage !== 0 && (
                                            <>
                                                <div className='flex items-center gap-1.5'>
                                                    <Star className='w-3 h-3 fill-amber-400 text-amber-400' />
                                                    <span className='text-[10px] font-black text-zinc-100'>{voteAverage.toFixed(1)}</span>
                                                </div>
                                                <span className='text-zinc-800 font-bold'>|</span>
                                            </>
                                        )}
                                        <span className='text-[10px] text-zinc-500 font-black uppercase tracking-widest'>{year}</span>
                                    </div>
                                    {type === 'person-credits' && (
                                        <span className='text-[10px] font-bold text-zinc-600 truncate'>
                                            {character ? `as ${character}` : job}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        )
                    }
                })}
            </div>
        </section>
    )
}
