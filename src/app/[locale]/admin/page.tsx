import { getUsers, getVisitors } from "@/lib/actions/admin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getAuthSession } from "@/lib/auth-sessions";
import { redirect } from "next/navigation";

export default async function AdminPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    const session = await getAuthSession();
    
    if (!session || session.user.role !== 'admin') {
        redirect(`/${locale}`);
    }

    const [users, visitors] = await Promise.all([
        getUsers(),
        getVisitors()
    ]);

    return (
        <AdminDashboard
            users={users}
            visitors={visitors}
            locale={locale}
        />
    );
}
