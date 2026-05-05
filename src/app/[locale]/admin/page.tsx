import { getUsers, getVisitors } from "@/lib/actions/admin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getAuthSession } from "@/lib/auth-sessions";
import { redirect } from "next/navigation";
import { Locale } from "@/lib/i18n/languageconfig";

export default async function AdminPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    const session = await getAuthSession();

    // Basic protection - in production this should be restricted to admin emails or roles
    if (!session) {
        redirect(`/${locale}/library`);
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
