import LibraryPageSkeleton from "@/components/library/LibraryPageSkeleton";
import { cookies } from "next/headers";

export default async function Loading() {
    const cookieStore = await cookies();
    const viewMode = cookieStore.get('libraryViewMode')?.value || 'grid';
    
    return <LibraryPageSkeleton viewMode={viewMode as 'grid' | 'list'} />;
}
