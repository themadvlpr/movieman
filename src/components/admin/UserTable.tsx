import { Film, List, User, Mail, Send, Calendar, Globe } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getLocalizedPath } from '@/lib/i18n/url-utils';

interface UserTableProps {
    users: {
        id: string;
        ip: string
        name: string;
        email: string;
        image?: string;
        telegramUsername?: string;
        encryptedId?: string;
        _count?: {
            userMedia: number;
            lists: number;
        };
        createdAt?: Date;
    }[];
    locale: string;
}



export default function UserTable({ users, locale }: UserTableProps) {

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {users.map((user, index) => (
                    <div key={user.id} className="rounded-xl border border-white/5 bg-zinc-900/50 p-4 space-y-4">
                        <span className="text-zinc-200 text-sm px-2 bg-white/5 rounded-md">{index + 1}</span>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-white/10 relative shrink-0">
                                {user.image ? (
                                    <Image src={user.image} alt={user.name || 'User'} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                        <User size={24} />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-zinc-100 truncate">{user.name || 'Anonymous'}</span>
                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                    <Calendar size={12} />
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('uk-UA') : 'No date'}
                                </span>
                            </div>
                        </div>
                        {user.ip && (
                            <div className="flex items-center gap-1">
                                <Globe size={12} className="text-zinc-500" />
                                <span className="font-mono text-zinc-200 text-sm">{user.ip}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-2 text-sm border-t border-white/5 pt-3">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Mail size={14} className="text-zinc-600 shrink-0" />
                                <span className="truncate">{user.email || 'No email'}</span>
                            </div>

                            {user.telegramUsername && (
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <Send size={14} className="text-blue-500 shrink-0" />
                                    <a href={`https://t.me/${user.telegramUsername}`} target="_blank" className="text-blue-400 hover:underline">
                                        @{user.telegramUsername}
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-1">
                            <Link
                                href={getLocalizedPath(`/sharelist/${user.encryptedId || user.id}`, locale)}
                                className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-xs font-medium transition-colors border border-white/5"
                            >
                                <Film size={14} className="text-zinc-400" />
                                Library ({user._count?.userMedia || 0})
                            </Link>
                            <div className="flex-1 flex items-center justify-center gap-2 bg-zinc-800/30 py-2 rounded-lg text-xs text-zinc-400 border border-white/5">
                                <List size={14} className="text-zinc-600" />
                                Lists: {user._count?.lists || 0}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block overflow-hidden rounded-xl border border-white/5 bg-zinc-900/30 backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 text-zinc-400 text-xs uppercase tracking-wider">
                            <th className="pl-1 font-medium">№</th>
                            <th className="p-4 font-medium">User</th>
                            <th className="p-4 font-medium">Contact Details</th>
                            <th className="p-4 font-medium text-center">Library & Lists</th>
                            <th className="p-4 font-medium text-right">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user, index) => (
                            <tr key={user.id} className="hover:bg-white/2 transition-colors">
                                <td className="align-top px-2 bg-white/5 ">
                                    <span className="text-zinc-200 text-sm">{index + 1}</span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10 relative shrink-0">
                                            {user.image ? (
                                                <Image src={user.image} alt={user.name || 'User'} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                                    <User size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-zinc-100 truncate max-w-[150px] inline-block">
                                                {user.name || 'Anonymous'}
                                            </span>
                                            {user.ip && (
                                                <div className="flex items-center gap-1">
                                                    <Globe size={12} className="text-zinc-500" />
                                                    <span className="font-mono text-zinc-200 text-sm">{user.ip}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                            <Mail size={14} className="text-zinc-600" />
                                            {user.email || 'No email'}
                                        </div>
                                        {user.telegramUsername && (
                                            <div className="flex items-center gap-2 text-xs">
                                                <Send size={12} className="text-blue-500/70" />
                                                <a className="text-blue-400/80 hover:text-blue-400 transition-colors" href={`https://t.me/${user.telegramUsername}`} target="_blank">
                                                    @{user.telegramUsername}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-4 text-sm">
                                        <Link
                                            href={getLocalizedPath(`/sharelist/${user.encryptedId || user.id}`, locale)}
                                            className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors group"
                                        >
                                            <Film size={14} className="text-zinc-500 group-hover:text-zinc-300" />
                                            <span className="underline decoration-zinc-700 group-hover:decoration-zinc-400 underline-offset-4">
                                                Library: {user._count?.userMedia || 0}
                                            </span>
                                        </Link>
                                        <div className="flex items-center gap-1.5 text-zinc-500">
                                            <List size={14} />
                                            Lists: {user._count?.lists || 0}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-right text-zinc-500 text-sm whitespace-nowrap">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('uk-UA') : 'No date'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}