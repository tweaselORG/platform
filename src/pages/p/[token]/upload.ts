import type { APIRoute } from 'astro';
import { z } from 'zod';
import { client, e } from '../../../lib/db';

const uploadSchema = z.object({
    token: z.string(),
});

export const POST: APIRoute = async ({ request, params, redirect }) => {
    const { token } = uploadSchema.parse(params);

    const proceeding = await e
        .select(e.Proceeding, (p) => ({
            state: true,

            filter: e.op(p.token, '=', token),
        }))
        .assert_single()
        .run(client);
    if (!proceeding) return new Response('Invalid token.', { status: 403 });

    if (proceeding.state !== 'awaitingControllerNotice')
        return new Response('You cannot upload this now.', { status: 400 });

    const data = await request.formData();
    const upload = data.get('upload') as File | null;
    if (!upload) return new Response('No file provided.', { status: 400 });

    const filename = upload.name;
    const file = new Uint8Array(await upload.arrayBuffer());

    await e
        .insert(e.MessageUpload, {
            proceeding: e
                .select(e.Proceeding, (p) => ({
                    filter: e.op(p.token, '=', token),
                }))
                .assert_single(),

            filename,
            file,
        })
        .run(client);

    if (proceeding.state === 'awaitingControllerNotice') return redirect(`/p/${token}`);
    throw new Error('This should never happen.');
};
