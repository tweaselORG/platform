import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { getAppMeta } from '../../../../lib/app-store/meta';
import { client, e } from '../../../../lib/db';
import { generateReference } from '../../../../lib/util';

const createProceedingSchema = z.object({
    platform: z.enum(['android', 'ios']),
    appId: z.string().max(150),
});

export const POST: APIRoute = async ({ params, redirect, currentLocale }) => {
    const { platform, appId } = createProceedingSchema.parse(params);

    const token = nanoid();

    const appMeta = await getAppMeta({ platform, appId, language: currentLocale as 'EN', country: 'DE' });
    if (!appMeta) return new Response('App not found.', { status: 404 });

    await e
        .insert(e.Proceeding, {
            app: e
                .insert(e.App, {
                    platform,
                    appId,
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
        })
        .run(client);

    return redirect(`/p/${token}`);
};
