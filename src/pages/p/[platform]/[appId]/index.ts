import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { startAnalysis } from '../../../../lib/api/analysis-runner-local';
import { getAppMeta } from '../../../../lib/app-store/meta';
import { client, e } from '../../../../lib/db';
import { ratelimit } from '../../../../lib/ratelimit';
import { generateReference } from '../../../../lib/util';

const createProceedingSchema = z.object({
    platform: z.enum(['android', 'ios']),
    appId: z.string().max(150),
});

export const POST: APIRoute = async ({ params, redirect, currentLocale, clientAddress }) => {
    await ratelimit({ ip: clientAddress, action: 'analysis' });

    const { platform, appId } = createProceedingSchema.parse(params);

    const token = nanoid();

    const appMeta = await getAppMeta({ platform, appId, language: currentLocale || 'en' });
    if (!appMeta) return new Response('App not found.', { status: 404 });

    const { token: analysisToken } = await startAnalysis(platform, appMeta.appId);

    try {
        await e
            .insert(e.Proceeding, {
                app: e
                    .insert(e.App, {
                        platform,
                        appId: appMeta.appId,
                        adamId: appMeta.adamId,
                    })
                    .unlessConflict((app) => ({
                        on: e.tuple([app.platform, app.appId]),
                        else: app,
                    })),

                token,
                reference: generateReference(new Date()),

                appName: appMeta.appName,
                developerName: appMeta.developerName,
                developerEmail: appMeta.developerEmail,
                developerAddress: appMeta.developerAddress,
                ...(appMeta.developerAddress && { developerAddressSourceUrl: appMeta.storeUrl }),
                privacyPolicyUrl: appMeta.privacyPolicyUrl,

                requestedAnalysis: e.insert(e.RequestedAnalysis, {
                    type: 'initial',
                    token: analysisToken,
                }),
            })
            .run(client);
    } catch (err) {
        return new Response('Database Error', { status: 500 });
    }

    return redirect(`/p/${token}`);
};
