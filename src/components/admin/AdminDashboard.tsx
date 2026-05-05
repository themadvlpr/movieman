'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserTable from '@/components/admin/UserTable';
import VisitorTable from '@/components/admin/VisitotTable';


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
                        "flex cursor-pointer items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300",
                        activeTab === 'users'
                            ? "bg-white text-black font-semibold shadow-lg shadow-white/10"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Users size={18} />
                    Users
                    <span className="text-xs bg-zinc-300 text-black font-semibold px-2 py-0.5 rounded-md ml-1">
                        {users.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('visitors')}
                    className={cn(
                        "flex cursor-pointer items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300",
                        activeTab === 'visitors'
                            ? "bg-white text-black font-semibold shadow-lg shadow-white/10"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Globe size={18} />
                    Visitors
                    <span className="text-xs bg-zinc-300 text-black font-semibold px-2 py-0.5 rounded-md ml-1">
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
                        <VisitorTable users={users} visitors={visitors} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}





