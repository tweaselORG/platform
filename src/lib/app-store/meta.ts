import { LRUCache } from 'lru-cache';
import pMemoize from 'p-memoize';
import {
    fetchAppDetails as _fetchAppDetailsAndroid,
    type AppDetailsResult as AppDetailsResultAndroid,
} from 'parse-play';
import {
    fetchAppDetails as _fetchAppDetailsIos,
    type AppDetailsAvailableAttribute,
    type AppDetailsResponse as AppDetailsResultIos,
} from 'parse-tunes';
import { cacheOptions, isAllowedApp, languageMappingIos, throttle } from './common';

export type GetAppMetaOptions = {
    /** On iOS, this has to be the adamId. */
    appId: string;
    platform: 'android' | 'ios';

    language: string;
};

export type AppMeta = {
    appId: string;
    adamId?: number;
    appName: string;
    storeUrl: string;

    developerName: string;
    developerEmail?: string;
    developerAddress?: string;
    privacyPolicyUrl?: string;

    ratingCount: number;
};

const androidCache = new LRUCache<string, AppDetailsResultAndroid[]>(cacheOptions);
const fetchAppDetailsAndroid = pMemoize(throttle('android', _fetchAppDetailsAndroid), {
    cacheKey: (args) => JSON.stringify(args),
    cache: androidCache,
});

const iosCache = new LRUCache<string, AppDetailsResultIos<'ios', AppDetailsAvailableAttribute>>(cacheOptions);
const fetchAppDetailsIos = pMemoize(throttle('ios', _fetchAppDetailsIos), {
    cacheKey: (args) => JSON.stringify(args),
    cache: iosCache,
});

export const getAppMeta = async (options: GetAppMetaOptions): Promise<AppMeta | undefined> => {
    if (options.platform === 'android') {
        const res = await fetchAppDetailsAndroid(
            { appId: options.appId },
            { language: options.language.toLocaleUpperCase() as 'EN', country: 'DE' },
        );
        if (!res) return undefined;

        if (!isAllowedApp({ downloads: res.downloads })) throw new Error('You cannot analyse this app.');

        return {
            appId: res.app_id,
            appName: res.name,
            storeUrl: 'https://play.google.com/store/apps/details?id=' + res.app_id,

            developerName: res.developer,
            developerEmail: res.developer_email,
            developerAddress: res.developer_address,
            privacyPolicyUrl: res.privacy_policy_url?.replace(/'"/g, ''),

            ratingCount: res.rating_counts.total,
        };
    } else if (options.platform === 'ios') {
        const res = await fetchAppDetailsIos({
            appId: +options.appId,
            platforms: ['iphone'],
            attributes: ['bundleId', 'name', 'url', 'artistName', 'privacyPolicyUrl', 'userRating'],
            ...languageMappingIos[options.language as 'en'],
        });

        if (!isAllowedApp({ ratings: res.userRating.ratingCount })) throw new Error('You cannot analyse this app.');

        const adamId = res.url.match(/\/id(\d+)(\?|$)/)?.[1];
        if (!adamId) throw new Error('This should never happen');

        const bundleId = res.platformAttributes.ios?.bundleId;
        if (!bundleId) throw new Error('This should never happen');

        return {
            appId: bundleId,
            adamId: +adamId,
            appName: res.name,
            storeUrl: res.url,

            developerName: res.artistName,
            privacyPolicyUrl: res.platformAttributes.ios?.privacyPolicyUrl,

            ratingCount: res.userRating.ratingCount,
        };
    }

    throw new Error('Unsupported platform: ' + options.platform);
};
