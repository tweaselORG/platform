import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { client, e } from '../../../../lib/db';
import { generateReference } from '../../../../lib/util';

const createProceedingSchema = z.object({
    platform: z.enum(['android', 'ios']),
    appId: z.string().max(150),
});

export const POST: APIRoute = async ({ params, redirect }) => {
    const { platform, appId } = createProceedingSchema.parse(params);

    const token = nanoid();

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
        })
        .run(client);

    return redirect(`/p/${token}`);
};
