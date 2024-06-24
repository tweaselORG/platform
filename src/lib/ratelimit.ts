import { RATELIMIT_POINTS } from 'astro:env/server';
import { getRandomValues } from 'crypto';
import { argon2id } from 'hash-wasm';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const ratelimitPeriodSeconds = 60 * 60 * 24;

const ratelimiter = new RateLimiterMemory({
    points: +RATELIMIT_POINTS,
    // The actual period is enforced by how often we regenerate the salt. We add some padding here because there might
    // be a delta between the ratelimiter's period and when we regenerate the salt.
    duration: 2 * ratelimitPeriodSeconds,
});

const saltCache: { salt: Uint8Array; changedAt: number | undefined } = {
    salt: new Uint8Array(16),
    changedAt: undefined,
};
const hash = (ip: string) => {
    if (!saltCache.changedAt || saltCache.changedAt + ratelimitPeriodSeconds * 1000 < Date.now()) {
        getRandomValues(saltCache.salt);
        saltCache.changedAt = Date.now();
    }

    return argon2id({
        password: 'IP::' + ip,
        salt: saltCache.salt,

        // Parameters chosen according to: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
        parallelism: 1,
        iterations: 2,
        memorySize: 19456,

        hashLength: 32,
        outputType: 'hex',
    });
};

const pointsPerAction = {
    search: 1,
    analysis: 10,
};
export const ratelimit = async (options: { ip: string; action: keyof typeof pointsPerAction }) =>
    ratelimiter.consume(await hash(options.ip), pointsPerAction[options.action]);
