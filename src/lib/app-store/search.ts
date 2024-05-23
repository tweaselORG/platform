import { LRUCache } from 'lru-cache';
import pMemoize from 'p-memoize';
import {
    searchApps as _searchAppsAndroid,
    type CountryCode,
    type LanguageCode,
    type SearchAppsResults as SearchAppsResultsAndroid,
} from 'parse-play';

export type SearchAppsOptions = {
    term: string;
    platform: 'android';

    language: LanguageCode;
    country: CountryCode;
};

export type AppSearchResult = {
    id: string;
    name: string;
    developer: string;
    platform: 'android';
}[];

const androidCache = new LRUCache<string, (SearchAppsResultsAndroid | undefined)[]>({
    max: 1000,
    ttl: 24 * 60 * 60 * 1000,
});
const searchAppsAndroid = pMemoize(_searchAppsAndroid, {
    cacheKey: (args) => JSON.stringify(args),
    cache: androidCache,
});

export const searchApps = async (options: SearchAppsOptions): Promise<AppSearchResult> => {
    if (options.platform === 'android') {
        const results = await searchAppsAndroid([{ searchTerm: options.term }], {
            language: options.language,
            country: options.country,
        });

        return (results || []).map((r) => ({
            id: encodeURIComponent(r.app_id),
            name: r.name,
            developer: r.developer,
            platform: 'android',
        }));
    }

    throw new Error('Unsupported platform: ' + options.platform);
};
