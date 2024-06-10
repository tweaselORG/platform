import type { APIRoute } from 'astro';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import type { UpdateShape } from '../../../../../dbschema/edgeql-js/update';
import { client, e } from '../../../../lib/db';
import { dpas } from '../../../../lib/dpas';

const complaintQuestionSchema = z.object({
    token: z.string(),
    question: z.enum(['askIsUserOfApp', 'askAuthority']),
});

export const POST: APIRoute = async ({ params, request, redirect }) => {
    const { token, question } = complaintQuestionSchema.parse(params);

    const proceeding = await e
        .select(e.Proceeding, () => ({
            state: true,
            complaintState: true,

            // eslint-disable-next-line camelcase
            filter_single: { token },
        }))
        .assert_single()
        .run(client);
    if (!proceeding) return new Response('Invalid token.', { status: 403 });

    if (proceeding.state !== 'awaitingComplaint') return new Response('You answer this question now.', { status: 400 });

    const set: UpdateShape<typeof e.Proceeding> = {};

    if (question === 'askIsUserOfApp') {
        const { answer } = zfd
            .formData({
                answer: zfd.text(z.enum(['yes', 'no'])),
            })
            .parse(await request.formData());

        set.complainantIsUserOfApp = answer === 'yes';
    } else if (question === 'askAuthority') {
        const { answer } = zfd
            .formData({
                answer: zfd.text(z.enum(Object.keys(dpas) as [string])),
            })
            .parse(await request.formData());

        set.complaintAuthority = answer;
    }

    await e
        .update(e.Proceeding, () => ({
            // eslint-disable-next-line camelcase
            filter_single: { token },

            set,
        }))
        .run(client);

    return redirect(`/p/${token}/complain`);
};
