import { LRUCache } from 'lru-cache';
import pMemoize from 'p-memoize';
import {
    fetchAppDetails as _fetchAppDetails,
    type AppDetailsResult,
    type CountryCode,
    type LanguageCode,
} from 'parse-play';

export type GetAppMetaOptions = {
    appId: string;
    platform: 'android' | 'ios';

    language: LanguageCode;
    country: CountryCode;
};

export type AppMeta = {
    appName: string;
    storeUrl: string;

    developerName: string;
    developerEmail?: string;
    developerAddress?: string;
    privacyPolicyUrl?: string;

    ratingCount: number;
};

const androidCache = new LRUCache<string, AppDetailsResult[]>({
    max: 1000,
    ttl: 24 * 60 * 60 * 1000,
});
const fetchAppDetailsAndroid = pMemoize(_fetchAppDetails, {
    cacheKey: (args) => JSON.stringify(args),
    cache: androidCache,
});

export const getAppMeta = async (options: GetAppMetaOptions): Promise<AppMeta | undefined> => {
    if (options.platform === 'android') {
        // eslint-disable-next-line camelcase
        const res = await fetchAppDetailsAndroid(
            { appId: options.appId },
            { language: options.language, country: options.country },
        );
        if (!res) return undefined;

        return {
            appName: res.name,
            storeUrl: 'https://play.google.com/store/apps/details?id=' + res.app_id,

            developerName: res.developer,
            developerEmail: res.developer_email,
            developerAddress: res.developer_address,
            privacyPolicyUrl: res.privacy_policy_url,

            ratingCount: res.rating_counts.total,
        };
    }

    throw new Error('Unsupported platform: ' + options.platform);
};
