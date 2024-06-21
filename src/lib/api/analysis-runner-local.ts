import { ANDROID_RUNNER_API_URL, ANDROID_RUNNER_TOKEN, IOS_RUNNER_API_URL, IOS_RUNNER_TOKEN } from 'astro:env/server';
import { z } from 'zod';

const getUrl = (platform: 'android' | 'ios', path: string): string =>
    new URL(path, platform === 'android' ? ANDROID_RUNNER_API_URL : IOS_RUNNER_API_URL).href;

const req = <T extends z.AnyZodObject>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    platform: 'android' | 'ios',
    path: string,
    resBodySchema: T,
    options?: {
        reqBody?: Record<string, unknown>;
    },
) =>
    fetch(getUrl(platform, path), {
        method: method,
        ...(options?.reqBody && { body: JSON.stringify(options.reqBody) }),
        headers: {
            Accept: 'application/json',
            ...(options?.reqBody && { 'Content-Type': 'application/json' }),
            Authorization: `Bearer ${platform === 'android' ? ANDROID_RUNNER_TOKEN : IOS_RUNNER_TOKEN}`,
        },
    }).then(async (r) => {
        const rawBody = await r.json();

        if (!r.ok) throw new Error('Failed to fetch: ' + r.statusText);

        const baseBodySchema = z.object({ status: z.enum(['success', 'error']), message: z.string() });
        const body = resBodySchema.merge(baseBodySchema).parse(rawBody) as z.infer<typeof baseBodySchema> & z.infer<T>;

        if (body.status !== 'success') throw new Error('Failed to fetch: ' + rawBody?.message);

        return body;
    });

export const startAnalysis = (platform: 'android' | 'ios', appId: string) =>
    req('PUT', platform, '/analysis', z.object({ token: z.string() }), { reqBody: { platform, appId } });
