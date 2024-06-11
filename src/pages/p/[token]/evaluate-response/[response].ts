import type { APIRoute } from 'astro';
import { z } from 'zod';
import { client, e } from '../../../../lib/db';
import { calculateDeadline } from '../../../../lib/proceeding';

const evaluateResponseSchema = z.object({
    token: z.string(),
    response: z.enum(['promise', 'denial', 'none']),
});

export const POST: APIRoute = async ({ params, redirect }) => {
    const { token, response } = evaluateResponseSchema.parse(params);

    const proceeding = await e
        .select(e.Proceeding, () => ({
            state: true,
            noticeSent: true,

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

    await e
        .update(e.Proceeding, () => ({
            // eslint-disable-next-line camelcase
            filter_single: { token },

            set: {
                controllerResponse: response,
            },
        }))
        .run(client);

    return redirect(`/p/${token}`);
};
