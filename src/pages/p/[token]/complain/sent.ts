import type { APIRoute } from 'astro';
import { z } from 'zod';
import { client, e } from '../../../../lib/db';
import { zodProceedingToken } from '../../../../lib/zod';

export const POST: APIRoute = async ({ params, redirect }) => {
    const { token } = z
        .object({
            token: zodProceedingToken,
        })
        .parse(params);

    const proceeding = await e
        .select(e.Proceeding, () => ({
            complaintState: true,

            // eslint-disable-next-line camelcase
            filter_single: { token },
        }))
        .assert_single()
        .run(client);
    if (!proceeding) return new Response('Invalid token.', { status: 403 });

    if (proceeding.complaintState !== 'readyToSend')
        return new Response('You cannot mark this complaint as sent now.', { status: 400 });

    await e
        .update(e.Proceeding, () => ({
            // eslint-disable-next-line camelcase
            filter_single: { token },

            set: {
                complaintSent: new Date(),
            },
        }))
        .run(client);

    return redirect(`/p/${token}`);
};
