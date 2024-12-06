import type { APIRoute } from 'astro';
import { z } from 'zod';
import { client, e } from '../../lib/db';
import { TweaselHarSchema } from '../../lib/tweasel-har-zod';

export const POST: APIRoute = async ({ request }) => {
    const res = z
        .object({
            analysisToken: z.string(),
            status: z.literal('success'),

            har: TweaselHarSchema,
            trackHarResult: z.array(
                z
                    .array(
                        z.object({
                            path: z.string(),
                            value: z.unknown(),
                            adapter: z.string(),
                            property: z.string(),
                            reasoning: z.string(),
                        }),
                    )
                    .or(z.null()),
            ),
        })
        .or(
            z.object({
                analysisToken: z.string(),
                status: z.literal('error'),
            }),
        )
        .parse(await request.json());

    const requestedAnalysis = await e
        .select(e.RequestedAnalysis, () => ({
            id: true,
            type: true,
            proceeding: { id: true, app: { appId: true } },

            // eslint-disable-next-line camelcase
            filter_single: { token: res.analysisToken },
        }))
        .assert_single()
        .run(client);
    if (!requestedAnalysis) return new Response('Invalid token.', { status: 403 });
    const proceeding = requestedAnalysis.proceeding;
    if (!proceeding) throw new Error('This should never happen.');

    const deleteRequestedAnalysis = () =>
        e
            .delete(e.RequestedAnalysis, () => ({
                // eslint-disable-next-line camelcase
                filter_single: { id: requestedAnalysis.id },
            }))
            .run(client);

    if (res.status === 'error') {
        await deleteRequestedAnalysis();

        return new Response('OK');
    }

    const apps = res.har.log._tweasel.apps;
    if (!apps) throw new Error('The HAR file does not contain any metadata on the app that was analyzed.');
    const app = apps[0];
    if (apps.length !== 1 || !app) throw new Error('The HAR file contains traffic for more than one app.');
    if (app.id !== proceeding.app.appId) throw new Error('The HAR file contains traffic for a different app.');

    await e
        .update(e.Proceeding, () => ({
            // eslint-disable-next-line camelcase
            filter_single: { id: proceeding.id },
            set: {
                [requestedAnalysis.type === 'initial' ? 'initialAnalysis' : 'secondAnalysis']: e.insert(e.Analysis, {
                    type: requestedAnalysis.type,

                    startDate: new Date(res.har.log._tweasel.startDate),
                    endDate: new Date(res.har.log._tweasel.endDate),

                    appVersion: app.version,
                    appVersionCode: app.versionCode,

                    har: JSON.stringify(res.har),
                    trackHarResult: res.trackHarResult,
                }),
            },
        }))
        .run(client);

    await deleteRequestedAnalysis();

    return new Response('OK');
};
