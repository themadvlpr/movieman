'use client'
import { useState } from 'react';
import { User, ChevronDown, Mail, Send } from 'lucide-react';


interface UserAccordionProps {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string;
        telegramUsername?: string;
    };
}

export default function UserAccordion({ user }: UserAccordionProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b w-fit border-zinc-800/50 last:border-0 overflow-hidden">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between py-3 cursor-pointer hover:bg-zinc-900/50 transition-colors px-2 rounded-t-lg"
            >
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <User size={14} className="text-zinc-500" />
                    <span className="font-medium text-zinc-200">{user.name}</span>
                </div>
                <ChevronDown
                    size={14}
                    className={`text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </div>

            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="p-3 pt-0 space-y-3 bg-zinc-900/30 rounded-b-lg">
                        <div className="flex items-start gap-3 pt-3 border-t border-zinc-800/50">
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full border border-zinc-700 object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                    <User size={20} className="text-zinc-600" />
                                </div>
                            )}

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-zinc-300">
                                    <Mail size={12} className="text-zinc-500" />
                                    <span>{user.email}</span>
                                </div>

                                {user.telegramUsername && (
                                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                                        <Send size={12} className="text-zinc-500" />
                                        <span className="text-blue-400">
                                            <a href={`https://t.me/${user.telegramUsername}`} target="_blank">@{user.telegramUsername}</a>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}