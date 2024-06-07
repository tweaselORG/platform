import type { APIRoute } from 'astro';
import { z } from 'zod';
import { client, e } from '../../../lib/db';

const uploadSchema = z.object({
    token: z.string(),
});

export const POST: APIRoute = async ({ request, params, redirect }) => {
    const { token } = uploadSchema.parse(params);

    const proceeding = await e
        .select(e.Proceeding, () => ({
            state: true,

            // eslint-disable-next-line camelcase
            filter_single: { token },
        }))
        .assert_single()
        .run(client);
    if (!proceeding) return new Response('Invalid token.', { status: 403 });

    if (!['awaitingControllerNotice', 'awaitingControllerResponse'].includes(proceeding.state))
        return new Response('You cannot upload this now.', { status: 400 });

    const data = await request.formData();
    const upload = data.get('upload') as File | null;
    if (!upload) return new Response('No file provided.', { status: 400 });

    const filename = upload.name;
    const file = new Uint8Array(await upload.arrayBuffer());

    await e
        .insert(e.MessageUpload, {
            proceeding: e
                .select(e.Proceeding, () => ({
                    // eslint-disable-next-line camelcase
                    filter_single: { token },
                }))
                .assert_single(),

            filename,
            file,
        })
        .run(client);
    if (proceeding.state === 'awaitingControllerNotice')
        await e
            .update(e.Proceeding, () => ({
                // eslint-disable-next-line camelcase
                filter_single: { token },

                set: {
                    noticeSent: new Date(),
                },
            }))
            .run(client);

    if (['awaitingControllerNotice', 'awaitingControllerResponse'].includes(proceeding.state))
        return redirect(`/p/${token}`);
    throw new Error('This should never happen.');
};
