import { Film, List, ExternalLink, User, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface UserTableProps {
    users: {
        id: string;
        name: string;
        email: string;
        image?: string;
        telegramUsername?: string;
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
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-zinc-900/30 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/5 text-zinc-400 text-sm uppercase tracking-wider">
                        <th className="p-4 font-medium">User</th>
                        <th className="p-4 font-medium">Email</th>
                        <th className="p-4 font-medium">Library & Lists</th>
                        <th className="p-4 font-medium">Joined</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-white/2 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10 relative">
                                        {user.image ? (
                                            <Image
                                                src={user.image}
                                                alt={user.name || 'User'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                                <User size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-medium text-zinc-100">{user.name || 'Anonymous'}</span>
                                </div>
                            </td>
                            <td className="p-4 text-zinc-400 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-zinc-600" />
                                    {user.email || 'No email'}
                                </div>
                                <div className="mt-2">
                                    tg: {user.telegramUsername ?
                                        <a className="text-blue-400" href={`https://t.me/${user.telegramUsername}`} target="_blank">@{user.telegramUsername}</a>
                                        : 'No nickname'}
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-4 text-sm">
                                    <Link
                                        href={`/${locale}/sharelist/${user.id}`}
                                        className="flex items-center gap-1.5 text-white hover:underline group"
                                    >
                                        <Film size={14} className="text-zinc-500 group-hover:text-white" />
                                        Library ({user._count?.userMedia || 0})
                                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                    <div className="flex items-center gap-1.5 text-zinc-400">
                                        <List size={14} className="text-zinc-600" />
                                        Lists: {user._count?.lists || 0}
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-zinc-500 text-sm">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('uk-UA') : 'No date'}                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}