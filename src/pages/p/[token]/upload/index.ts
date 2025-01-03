import type { APIRoute } from 'astro';
import { detectBufferMime } from 'mime-detect';
import cleanFileName from 'sanitize-filename';
import { z } from 'zod';
import { client, e } from '../../../../lib/db';
import { zodProceedingToken } from '../../../../lib/zod';

const uploadSchema = z.object({
    token: zodProceedingToken,
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

    const filename = cleanFileName(upload.name);
    const fileArrayBuffer = await upload.arrayBuffer();
    const file = new Uint8Array(fileArrayBuffer);

    const mime = (await detectBufferMime(Buffer.from(fileArrayBuffer))).replace(/;.+$/, '');
    if (!['message/rfc822', 'application/pdf', 'text/plain'].includes(mime))
        return new Response('Disallowed file type.', { status: 400 });

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
