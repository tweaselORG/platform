import type { APIRoute } from 'astro';
import { generate } from 'reporthar';
import { z } from 'zod';
import { client, e } from '../../../../lib/db';

const getAttachmentSchema = z.object({
    token: z.string(),
    type: z.enum(['initial-har', 'initial-report', 'notice']),
});

export const GET: APIRoute = async ({ params, currentLocale }) => {
    const { token, type } = getAttachmentSchema.parse(params);

    const proceeding = await e
        .select(e.Proceeding, (p) => ({
            reference: true,
            state: true,

            initialAnalysis: {
                har: true,
                trackHarResult: true,
            },

            filter: e.op(p.token, '=', token),
        }))
        .assert_single()
        .run(client);
    if (!proceeding?.initialAnalysis) return new Response('Invalid token.', { status: 403 });

    switch (type) {
        case 'initial-har': {
            if (proceeding.state !== 'awaitingControllerNotice')
                return new Response('You cannot download this file yet/anymore.', { status: 400 });

            return new Response(proceeding.initialAnalysis.har, {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="${proceeding.reference}-traffic.har"`,
                },
            });
        }
        case 'initial-report':
        case 'notice': {
            if (proceeding.state !== 'awaitingControllerNotice')
                return new Response('You cannot download this file yet/anymore.', { status: 400 });

            const docType = type === 'initial-report' ? 'report' : 'notice';
            const pdf = await generate({
                type: docType,
                language: currentLocale as 'en',

                har: JSON.parse(proceeding.initialAnalysis.har),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                trackHarResult: proceeding.initialAnalysis.trackHarResult as any,
            });

            return new Response(pdf, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `inline; filename="${proceeding.reference}-${docType}.pdf"`,
                },
            });
        }

        default:
            return new Response('Invalid type.', { status: 400 });
    }
};
