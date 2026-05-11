// Cache config for different endpoints
export const CacheConfig = {
    DETAILS: { revalidate: 3600 },
    LISTS: { revalidate: 900 },
    SEARCH: { revalidate: 300 },
    STATIC: { revalidate: 86400 },
};