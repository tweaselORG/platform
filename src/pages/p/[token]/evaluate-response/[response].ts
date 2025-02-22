import type { APIRoute } from 'astro';
import { z } from 'zod';
import { startAnalysis } from '../../../../lib/api/analysis-runner-local';
import { client, e } from '../../../../lib/db';
import { calculateDeadline } from '../../../../lib/proceeding';
import { zodProceedingToken } from '../../../../lib/zod';

const evaluateResponseSchema = z.object({
    token: zodProceedingToken,
    response: z.enum(['promise', 'denial', 'none']),
});

export const POST: APIRoute = async ({ params, redirect }) => {
    const { token, response } = evaluateResponseSchema.parse(params);

    const proceeding = await e
        .select(e.Proceeding, () => ({
            state: true,
            noticeSent: true,

            app: {
                appId: true,
                platform: true,
            },

            // eslint-disable-next-line camelcase
            filter_single: { token },
        }))
        .assert_single()
        .run(client);
    if (!proceeding) return new Response('Invalid token.', { status: 403 });

    if (!['awaitingControllerResponse'].includes(proceeding.state) || !proceeding.noticeSent)
        return new Response('You cannot evaluate the response to this proceeding now.', { status: 400 });

    if (response === 'none' && new Date() < calculateDeadline(proceeding.noticeSent))
        return new Response('Give the developer until the end of the deadline to respond.', { status: 400 });

    const { token: analysisToken } = await startAnalysis(proceeding.app.platform, proceeding.app.appId);

    await e
        .update(e.Proceeding, () => ({
            // eslint-disable-next-line camelcase
            filter_single: { token },

            set: {
                controllerResponse: response,

                requestedAnalysis: e.insert(e.RequestedAnalysis, {
                    type: 'second',
                    token: analysisToken,
                }),
            },
        }))
        .run(client);

    return redirect(`/p/${token}`);
};
