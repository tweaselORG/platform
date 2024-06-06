import { LRUCache } from 'lru-cache';
import pMemoize from 'p-memoize';
import { fetchDataSafetyLabels as _fetchDataSafetyLabels, type DataSafetyLabel, type LanguageCode } from 'parse-play';

export type GetAppMetaOptions = {
    appId: string;
    platform: 'android' | 'ios';

    language: LanguageCode;
};

export type AppMeta = {
    appName: string;
    developerName: string;
    developerEmail: string;
    developerAddress?: string;
    privacyPolicyUrl?: string;
};

const androidCache = new LRUCache<string, (DataSafetyLabel | undefined)[]>({
    max: 1000,
    ttl: 24 * 60 * 60 * 1000,
});
const fetchDataSafetyLabelsAndroid = pMemoize(_fetchDataSafetyLabels, {
    cacheKey: (args) => JSON.stringify(args),
    cache: androidCache,
});

export const getAppMeta = async (options: GetAppMetaOptions): Promise<AppMeta | undefined> => {
    if (options.platform === 'android') {
        // eslint-disable-next-line camelcase
        const res = await fetchDataSafetyLabelsAndroid({ app_id: options.appId }, { language: options.language });
        if (!res) return undefined;

        return {
            appName: res.name,
            developerName: res.developer.name,
            developerEmail: res.developer.email,
            developerAddress: res.developer.address,
            privacyPolicyUrl: res.privacy_policy_url,
        };
    }

    throw new Error('Unsupported platform: ' + options.platform);
};
