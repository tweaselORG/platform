import { LRUCache } from 'lru-cache';
import pMemoize from 'p-memoize';
import { searchApps as _searchAppsAndroid, type SearchAppsResults as SearchAppsResultsAndroid } from 'parse-play';
import { searchApps as _searchAppsIos, type AppSearchResponse as SearchAppsResultsIos } from 'parse-tunes';
import { cacheOptions, isAllowedApp, languageMappingIos, throttle } from './common';

export type SearchAppsOptions = {
    term: string;
    platform: 'android' | 'ios';

    language: string;
};

export type AppSearchResult =
    | {
          id: string;
          name: string;
          developer: string;
          platform: 'android';
      }[]
    | {
          id: string;
          adamId: number;
          name: string;
          developer: string;
          platform: 'ios';
      }[];

const androidCache = new LRUCache<string, (SearchAppsResultsAndroid | undefined)[]>(cacheOptions);
const searchAppsAndroid = pMemoize(throttle('android', _searchAppsAndroid), {
    cacheKey: (args) => JSON.stringify(args),
    cache: androidCache,
});

const iosCache = new LRUCache<string, SearchAppsResultsIos<'ios'>>(cacheOptions);
const searchAppsIos = pMemoize(throttle('ios', _searchAppsIos), {
    cacheKey: (args) => JSON.stringify(args),
    cache: iosCache,
});

export const searchApps = async (options: SearchAppsOptions): Promise<AppSearchResult> => {
    if (options.platform === 'ios') throw new Error('I cannot let you do that.');

    if (options.platform === 'android') {
        const results = await searchAppsAndroid([{ searchTerm: options.term }], {
            language: options.language.toLocaleUpperCase() as 'EN',
            country: 'DE',
        });

        return (results || [])
            .filter((r) => isAllowedApp({ downloads: r.downloads }))
            .map((r) => ({
                id: encodeURIComponent(r.app_id),
                name: r.name,
                developer: r.developer,
                downloads: r.downloads,
                platform: 'android' as const,
            }));
    } else if (options.platform === 'ios') {
        const results = await searchAppsIos({
            searchTerm: options.term,
            platforms: ['iphone'],
            ...languageMappingIos[options.language as 'en'],
        });

        return results
            .filter((r) => isAllowedApp({ ratings: r.userRating.ratingCount }))
            .map((r) => {
                // Annoyingly, iOS has two different app IDs: a numerical one (adamId) and a string one (bundleId). For the
                // getAppMeta() endpoint, we need the adamId, for everything else, we need the bundleId.
                const adamId = r.url.match(/\/id(\d+)(\?|$)/)?.[1];
                if (!adamId) throw new Error('This should never happen');

                const bundleId = r.platformAttributes.ios?.bundleId;
                if (!bundleId) throw new Error('This should never happen');

                return {
                    id: encodeURIComponent(bundleId),
                    adamId: +adamId,
                    name: r.name,
                    developer: r.artistName,
                    ratings: r.userRating.ratingCount,
                    platform: 'ios' as const,
                };
            });
    }

    throw new Error('Unsupported platform: ' + options.platform);
};
