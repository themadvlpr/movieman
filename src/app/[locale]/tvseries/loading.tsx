import MediaPageSkeleton from "@/components/movie-tv/MediaPageSkeleton";
import { cookies } from "next/headers";

export default async function Loading() {
    const cookieStore = await cookies();
    const viewMode = cookieStore.get('tvseriesViewMode')?.value || 'grid';
    
    return <MediaPageSkeleton viewMode={viewMode as 'grid' | 'list'} />;
}
