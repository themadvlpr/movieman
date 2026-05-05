import { MapPin, Monitor, Clock, Globe } from "lucide-react";
import UserAccordion from "@/components/admin/UserAccordion";
import { useMemo } from "react";

interface VisitorTableProps {
    visitors: {
        id: string;
        ip: string;
        country: string;
        device: string;
        browser: string;
        os: string;
        path: string;
        lastVisit: Date;
    }[];
    users: {
        id: string;
        ip: string;
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
}


export default function VisitorTable({ visitors, users }: VisitorTableProps) {
    const usersByIp = useMemo(() => {
        return users.reduce((acc, user) => {
            if (!acc[user.ip]) acc[user.ip] = [];
            acc[user.ip].push(user);
            return acc;
        }, {} as Record<string, typeof users>);
    }, [users]);

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {visitors.map((visitor, index) => (
                    <div key={visitor.id} className="rounded-xl border border-white/5 bg-zinc-900/50 p-4 space-y-3">
                        <span className="text-zinc-200 text-sm px-2 bg-white/5 rounded-md">{index + 1}</span>
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 ">
                                    <Globe size={12} className="text-zinc-500" />
                                    <span className="font-mono text-zinc-200 text-sm font-bold">{visitor.ip}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                    <MapPin size={12} />
                                    {visitor.country || 'Unknown'}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-1.5 text-xs text-zinc-500">
                                    <Clock size={12} />
                                    {visitor.lastVisit ? new Date(visitor.lastVisit).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-2 text-xs space-y-1">
                            <div className="flex items-center gap-2 text-zinc-300">
                                <Monitor size={12} />
                                <span>{visitor.device} — {visitor.os}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Globe size={12} />
                                <span className="truncate max-w-[200px]">{visitor.path}</span>
                            </div>
                        </div>

                        {usersByIp[visitor.ip]?.map((user) => (
                            <UserAccordion key={user.id} user={user} />
                        ))}
                    </div>
                ))}
            </div>

            <div className="hidden md:block overflow-hidden rounded-xl border border-white/5 bg-zinc-900/30 backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 text-zinc-400 text-xs uppercase tracking-wider">
                            <th className="pl-1 font-medium">№</th>
                            <th className="p-4 font-medium">IP & Location</th>
                            <th className="p-4 font-medium">Device & Browser</th>
                            <th className="p-4 font-medium">Last Path</th>
                            <th className="p-4 font-medium">Visit Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {visitors.map((visitor, index) => (
                            <tr key={visitor.id} className="hover:bg-white/2 transition-colors">
                                <td className="align-top px-2 bg-white/5 ">
                                    <span className="text-zinc-200 text-sm">{index + 1}</span>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Globe size={12} className="text-zinc-500" />
                                            <span className="font-mono text-zinc-200 text-sm">{visitor.ip}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                            <MapPin size={12} />
                                            {visitor.country || 'Unknown'}
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            {usersByIp[visitor.ip]?.map((user) => (
                                                <UserAccordion key={user.id} user={user} />
                                            ))}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 align-top">
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
                                <td className="p-4 align-top">
                                    <span className="text-zinc-400 text-xs bg-white/5 px-2 py-1 rounded inline-block max-w-[150px] truncate">
                                        {visitor.path}
                                    </span>
                                </td>
                                <td className="p-4 align-top text-zinc-500 text-sm whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        {visitor.lastVisit ? new Date(visitor.lastVisit).toLocaleString('uk-UA') : 'No date'}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}