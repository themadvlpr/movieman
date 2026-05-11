import { Star } from "lucide-react";


export default function StarRating({ text, ratingType }: { text: string, ratingType: 'my' | 'user' | 'tmdb' }) {

    const bgColor = ratingType === 'my' ? 'bg-blue-500/20 text-blue-400' : ratingType === 'user' ? 'bg-white/10 text-blue-400' : 'bg-white/10 text-yellow-400'
    const iconColor = ratingType === 'my' ? 'fill-blue-400 text-blue-400' : ratingType === 'user' ? 'fill-blue-400/50 text-blue-400/50' : 'fill-yellow-400 text-yellow-400'

    return (
        <div className={`flex w-fit items-center gap-1.5 px-2 py-1 rounded-md ${bgColor}`}>
            <Star className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${iconColor}`} />
            <span className="text-white text-[10px] sm:text-xs font-bold">
                {text}
            </span>
        </div>
    )
}
