import { RateLimiterMemory, RateLimiterQueue } from 'rate-limiter-flexible';

export const languageMappingIos = {
    en: {
        country: 'DE',
        language: 'en-GB',
    },
} as const;

export const cacheOptions = {
    max: 1000,
    ttl: 24 * 60 * 60 * 1000,
};

// In Android search results, we only get the number of downloads as a string like this: `10,000,000+`
const parseApproximateNumber = (downloads: string | number) =>
    typeof downloads === 'number' ? downloads : +downloads.replace(/[^0-9]/g, '');
export const isAllowedApp = (options: { ratings: number } | { downloads: string | number }) =>
    'downloads' in options ? parseApproximateNumber(options.downloads) > 10000 : options.ratings > 500;

const maxQueueSize = 100;

const ratelimiterAndroid = new RateLimiterMemory({ points: 1, duration: 2 });
const ratelimiterIos = new RateLimiterMemory({ points: 1, duration: 2 });

const throttlerAndroid = new RateLimiterQueue(ratelimiterAndroid, { maxQueueSize });
const throttlerIos = new RateLimiterQueue(ratelimiterIos, { maxQueueSize });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const throttle = <FunctionT extends (...args: any[]) => Promise<any>>(
    platform: 'android' | 'ios',
    func: FunctionT,
): FunctionT =>
    ((...args) =>
        (platform === 'android' ? throttlerAndroid : throttlerIos)
            .removeTokens(1)
            .then(() => func(...args))) as FunctionT;
