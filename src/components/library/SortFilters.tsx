import { motion, AnimatePresence } from "framer-motion"
import { Filter, ArrowUp, ArrowDown, X, Loader2, Download } from "lucide-react"
import { exportAllUserMediaAction } from "@/lib/actions/exportAllUserMediaAction"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { useMemo } from "react";
import { TMDB_LANGUAGES, Locale } from "@/lib/i18n/languageconfig";
import { useTranslation } from "@/providers/LocaleProvider";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


type SortField = 'title' | 'watchedDate' | 'year' | 'userRating' | 'rating';
type SortOrder = 'asc' | 'desc';

interface SortFiltersProps {
    t: ReturnType<typeof useTranslation>['t'];
    isPublic: boolean;
    showFilters: boolean;
    setShowFilters: (value: boolean) => void;
    selectedGenre: string;
    setSelectedGenre: (value: string) => void;
    selectedYear: string;
    setSelectedYear: (value: string) => void;
    setIsExporting: (value: boolean) => void;
    userId: string;
    sortBy: SortField;
    setSortBy: (value: SortField) => void;
    sortOrder: SortOrder;
    setSortOrder: (value: SortOrder) => void;
    isExporting: boolean;
    locale: Locale;
}




export default function SortFilters({
    t, isPublic,
    showFilters, setShowFilters, selectedGenre,
    setSelectedGenre, selectedYear,
    setSelectedYear, setIsExporting, userId, sortBy,
    setSortBy, sortOrder, setSortOrder, isExporting, locale }: SortFiltersProps) {

    const genreIds = [
        28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402,
        9648, 10749, 878, 10770, 53, 10752, 37, 10759, 10762,
        10763, 10764, 10765, 10766, 10767, 10768
    ];

    const sortOptions = [
        { key: 'title', label: 'name' },
        ...(isPublic ? [] : [{ key: 'watchedDate', label: 'watchDate' }]),
        { key: 'year', label: 'releaseDate' },
        { key: 'userRating', label: 'userRating' },
        { key: 'rating', label: 'tmdbRating' },
    ];

    const genres = useMemo(() => {
        return genreIds.map((id) => ({
            id: id.toString(),
            name: t('genres', `${id}`)
        }));
    }, [t]);

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const yearsList = [];
        for (let y = currentYear; y >= 1900; y--) {
            yearsList.push(y.toString());
        }
        return yearsList;
    }, []);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            toast.loading(t('common', 'gatheringAllYourMedia'));

            const result = await exportAllUserMediaAction(userId, TMDB_LANGUAGES[locale as Locale]);

            toast.dismiss();

            if (!result.success || !result.data) {
                toast.error("Failed to export library");
                return;
            }

            if (result.data.length === 0) {
                toast.info("Your library is empty");
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(result.data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "All Media");

            const fileName = `MyLibrary_AllMedia_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);

            toast.success(t('common', 'libraryExportedSuccessfully'));
        } catch (error) {
            console.error("Export Error: ", error);
            toast.dismiss();
            toast.error("Failed to export library");
        } finally {
            setIsExporting(false);
        }
    };


    return (
        <>
            <div className="flex gap-3 flex-wrap">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">
                        {t('common', 'filter')}
                    </span>
                    <div className={`group w-fit flex items-center border transition-all duration-300 rounded-md overflow-hidden ${showFilters
                        ? 'bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                        : 'bg-white/5 backdrop-blur-md border-white/10'
                        }`}>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-3 py-2 transition-colors cursor-pointer ${showFilters ? 'text-black' : 'text-white hover:bg-white/10'
                                }`}
                        >
                            <Filter
                                className={`w-4 h-4 transition-colors ${showFilters
                                    ? 'text-black animate-pulse'
                                    : (selectedGenre !== 'all' || selectedYear !== 'all')
                                        ? 'fill-white'
                                        : 'text-white'
                                    }`}
                            />
                            <span className="text-xs font-semibold">
                                {showFilters ? t('common', 'hideFilters') : t('common', 'showFilters')}
                            </span>
                        </button>

                        {(selectedGenre !== 'all' || selectedYear !== 'all') && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedGenre('all');
                                    setSelectedYear('all');
                                }}
                                className={`flex items-center justify-center px-2 self-stretch border-l transition-colors cursor-pointer ${showFilters
                                    ? 'border-black/10 text-black hover:bg-black/5'
                                    : 'border-white/10 text-white hover:bg-white/10'
                                    }`}
                                title={t('common', 'resetFilters')}
                            >
                                <X className="w-3.5 h-3.5 stroke-[3px]" />
                            </button>
                        )}
                    </div>
                </div>
                {/* Sort Options */}
                <div className="flex flex-col gap-1.5 md:w-fit">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">
                        {t('common', 'sortBy')}
                    </span>
                    <div className="flex w-fit items-center gap-1 bg-white/5 border border-white/10 rounded-md">
                        <Select
                            value={sortBy}
                            onValueChange={(value) => setSortBy(value as SortField)}
                        >
                            <SelectTrigger className="h-9 border-0 bg-transparent text-white text-xs font-semibold focus:ring-0 focus:ring-offset-0 cursor-pointer min-w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900/95 border-white/10 text-white rounded-xl shadow-2xl p-1">
                                {sortOptions.map((opt) => opt && (
                                    <SelectItem
                                        key={opt.key}
                                        value={opt.key}
                                        className="text-xs focus:bg-white/10 focus:text-white cursor-pointer px-2.5"
                                    >
                                        {t('common', opt.label)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="w-px h-4 bg-white/10" />

                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                            aria-label="Toggle Sort Order"
                        >
                            {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, scale: 0.98 }}
                        animate={{ height: "auto", opacity: 1, scale: 1 }}
                        exit={{ height: 0, opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col mt-5 md:flex-row flex-wrap items-stretch md:items-center gap-3 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-md">
                            {/* Genre Filter */}
                            <div className="flex flex-col gap-1.5 w-fit">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">{t('common', 'genre')}</span>
                                <div className="relative group">
                                    <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                                        <SelectTrigger className={`w-full md:w-fit cursor-pointer min-w-[130px] bg-white/5 border-white/10 rounded-md text-xs font-semibold text-white hover:bg-white/10 transition-all focus:ring-0 focus:ring-offset-0 ${selectedGenre !== 'all' ? 'pr-9' : ''}`}>
                                            <SelectValue placeholder={t('common', 'genre')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white rounded-md shadow-2xl p-1">
                                            <SelectItem value="all" className="text-xs focus:bg-white/10 focus:text-white cursor-pointer">
                                                {t('common', 'genre')}
                                            </SelectItem>
                                            {genres.map((g) => (
                                                <SelectItem key={g.id} value={g.id.toString()} className="text-xs focus:bg-white/10 focus:text-white cursor-pointer">
                                                    {g.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedGenre !== 'all' && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedGenre('all');
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:text-white text-zinc-500 transition-colors z-20 cursor-pointer"
                                        >
                                            <X className="w-3 h-3 stroke-[3px]" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Year Filter */}
                            <div className="flex flex-col gap-1.5 w-fit">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">{t('common', 'year')}</span>
                                <div className="relative group">
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger className={`w-full md:w-fit cursor-pointer min-w-[100px] bg-white/5 border-white/10 rounded-md text-xs font-semibold text-white hover:bg-white/10 transition-all focus:ring-0 focus:ring-offset-0 ${selectedYear !== 'all' ? 'pr-9' : ''}`}>
                                            <SelectValue placeholder={t('common', 'year')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white rounded-md p-1 shadow-2xl">
                                            <SelectItem value="all" className="text-xs focus:bg-white/10 focus:text-white cursor-pointer">
                                                {t('common', 'year')}
                                            </SelectItem>
                                            {years.map((y) => (
                                                <SelectItem key={y} value={y.toString()} className="text-xs focus:bg-white/10 focus:text-white cursor-pointer">
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedYear !== 'all' && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedYear('all');
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:text-white text-zinc-500 transition-colors z-20 cursor-pointer"
                                        >
                                            <X className="w-3 h-3 stroke-[3px]" />
                                        </button>
                                    )}
                                </div>
                            </div>



                            <div className="flex-1 hidden md:block" />

                            <div className="flex flex-col gap-1.5 md:w-fit md:justify-end">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1 md:text-right">{t('common', 'actions')}</span>
                                <div className="flex items-center gap-2">
                                    {!isPublic && (
                                        <>
                                            <button
                                                onClick={handleExport}
                                                disabled={isExporting}
                                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5 whitespace-nowrap"
                                                aria-label="Export all to Excel"
                                                title="Export all to Excel"
                                            >
                                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                <span>{t('common', 'exportAll')}</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}