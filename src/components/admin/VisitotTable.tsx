import { MapPin, Monitor, Clock } from "lucide-react";
import UserAccordion from "@/components/admin/UserAccordion";

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
                        <tr key={visitor.id} className="hover:bg-white/2 transition-colors">
                            <td className="p-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-mono text-zinc-200 text-sm">{visitor.ip}</span>
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                        <MapPin size={12} />
                                        {visitor.country || 'Unknown'}
                                    </div>
                                    {users.map((user) => (
                                        user.ip === visitor.ip && (
                                            <div key={user.id}>
                                                <UserAccordion user={user} />
                                            </div>
                                        )
                                    ))}
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
                                    {visitor.lastVisit ? new Date(visitor.lastVisit).toLocaleString('uk-UA') : 'No date'}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}