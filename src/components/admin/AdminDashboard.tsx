'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Globe, Monitor, MapPin, Clock, ExternalLink, Mail, List, Film } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AdminDashboardProps {
    users: any[];
    visitors: any[];
    locale: string;
}

export default function AdminDashboard({ users, visitors, locale }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<'users' | 'visitors'>('users');

    return (
        <div className="container mx-auto px-4 py-20">
            <h1 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                <div className="w-2 h-8 bg-white rounded-full" />
                Admin Panel
            </h1>

            <div className="flex gap-4 mb-8 bg-zinc-900/50 p-1 rounded-xl w-fit border border-white/5">
                <button
                    onClick={() => setActiveTab('users')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300",
                        activeTab === 'users'
                            ? "bg-white text-black font-semibold shadow-lg shadow-white/10"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Users size={18} />
                    Users
                    <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full ml-1">
                        {users.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('visitors')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300",
                        activeTab === 'visitors'
                            ? "bg-white text-black font-semibold shadow-lg shadow-white/10"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Globe size={18} />
                    Visitors
                    <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full ml-1">
                        {visitors.length}
                    </span>
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'users' ? (
                    <motion.div
                        key="users"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <UserTable users={users} locale={locale} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="visitors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <VisitorTable visitors={visitors} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function UserTable({ users, locale }: { users: any[], locale: string }) {
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
                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
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
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function VisitorTable({ visitors }: { visitors: any[] }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-zinc-900/30 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/5 text-zinc-400 text-sm uppercase tracking-wider">
                        <th className="p-4 font-medium">IP & Location</th>
                        <th className="p-4 font-medium">Device & Browser</th>
                        <th className="p-4 font-medium">Last Path</th>
                        <th className="p-4 font-medium">Visit Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {visitors.map((visitor) => (
                        <tr key={visitor.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-mono text-zinc-200 text-sm">{visitor.ip}</span>
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                        <MapPin size={12} />
                                        {visitor.country || 'Unknown'}
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-col gap-1 text-sm">
                                    <div className="flex items-center gap-2 text-zinc-200">
                                        <Monitor size={14} className="text-zinc-500" />
                                        {visitor.device}
                                    </div>
                                    <span className="text-xs text-zinc-500 ml-5">
                                        {visitor.browser} • {visitor.os}
                                    </span>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className="text-zinc-400 text-sm bg-white/5 px-2 py-1 rounded">
                                    {visitor.path}
                                </span>
                            </td>
                            <td className="p-4 text-zinc-500 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    {new Date(visitor.lastVisit).toLocaleString()}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
