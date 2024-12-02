import type { APIRoute } from 'astro';
import { z } from 'zod';
import { client, e } from '../../../../../lib/db';

const deleteSchema = z.object({
    token: z.string(),
    id: z.string(),
});

// We can't use `DELETE` since that isn't supported by HTML forms.
export const POST: APIRoute = async ({ params, redirect }) => {
    const { token, id } = deleteSchema.parse(params);

    const proceeding = await e
        .select(e.Proceeding, () => ({
            state: true,

            // eslint-disable-next-line camelcase
            filter_single: { token },
        }))
        .assert_single()
        .run(client);
    if (!proceeding) return new Response('Invalid token.', { status: 403 });

    if (!['awaitingControllerResponse'].includes(proceeding.state))
        return new Response('You cannot delete uploads now.', { status: 400 });

    await e
        .delete(e.MessageUpload, (m) => ({
            filter: e.all(e.set(e.op(m.proceeding.token, '=', token), e.op(m.id, '=', e.uuid(id)))),
            limit: 1,
        }))
        .run(client);

    return redirect(`/p/${token}`);
};
