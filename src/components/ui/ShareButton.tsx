import { Share2, Link as LinkIcon } from 'lucide-react';
import { useTranslation } from '@/providers/LocaleProvider';
import { toast } from 'sonner';

export default function ShareButton({ title }: { title: string }) {
    const { t } = useTranslation();
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const shareData = {
        title: title,
        url: currentUrl,
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success(t('common', 'linkCopied'));
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    toast.error(t('common', 'failedToCopyLink'));
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareData.url);
                toast(t('common', 'linkCopied'), {
                    description: t('common', 'nowYouCanSendItToYourFriends'),
                    icon: <LinkIcon className="h-4 w-4" />,
                });
            } catch (err) {
                toast.error(t('common', 'failedToCopyLink'));
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="group cursor-pointer relative flex items-center gap-2 overflow-hidden rounded-md 
                 bg-white/10 px-6 py-2.5 text-sm font-medium text-slate-900 
                 shadow-[0_0_1px_rgba(0,0,0,0.1)] outline-none ring-1 ring-slate-900/5 
                 transition-all hover:bg-white/20 hover:ring-slate-900/10 
                 active:scale-95 dark:text-white dark:ring-white/10"
        >
            <Share2 className="h-4 w-4 text-zinc-300 transition-transform group-hover:rotate-12" />
            <span className='text-zinc-300'>{t('common', 'share')}</span>

            <div className="absolute inset-0 flex h-full w-full justify-center transform-[skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                <div className="relative h-full w-8 bg-white/20" />
            </div>
        </button>
    );
};

