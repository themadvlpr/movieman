import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export const ExpandableMarkdown = ({ content, t }: { content: string, t: (key: string, value: string) => string }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const isLongText = content.split('\n').length > 4;

    return (
        <div className="relative">
            <motion.div
                initial={false}
                layout
                animate={{
                    height: isExpanded ? 'auto' : '160px', // ~4-5 строк текста
                }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], height: { duration: 0.8 } }}
                className="overflow-hidden relative markdown-content"
                style={{
                    maskImage: !isExpanded && isLongText
                        ? 'linear-gradient(to bottom, black 50%, transparent 100%)'
                        : 'none',
                    WebkitMaskImage: !isExpanded && isLongText
                        ? 'linear-gradient(to bottom, black 50%, transparent 100%)'
                        : 'none'
                }}
            >
                <div onClick={() => setIsExpanded(true)} className={!isExpanded ? 'cursor-pointer' : ''}>
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </motion.div>

            {isLongText && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 cursor-pointer text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
                >
                    {isExpanded ? (
                        <><span>↑</span> {t('common', 'showLess') || 'Show Less'}</>
                    ) : (
                        <><span>↓</span> {t('common', 'readMore') || 'Read More'}</>
                    )}
                </button>
            )}
        </div>
    );
};