import type { APIRoute } from 'astro';
import JSZip from 'jszip';
import type { PartialDeep } from 'type-fest';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { client, e } from '../../../lib/db';
import { generateReference } from '../../../lib/util';

export const POST: APIRoute = async ({ request, redirect }) => {
    const { proceedingTokens, dataPortabilityRequest } = zfd
        .formData({
            proceedingTokens: zfd.text(
                z.string().transform((t) =>
                    t
                        .split(/[\n\r]/)
                        .map((t) => (t.includes('/') ? /\/p\/([A-Za-z0-9_-]+)/.exec(t)?.[1] || '' : t))
                        .map((t) => t.trim())
                        .filter(Boolean),
                ),
            ),
            dataPortabilityRequest: zfd.checkbox(),
        })
        .parse(await request.formData());

    const proceedings = await e
        .select(e.Proceeding, (p) => ({
            ...e.Proceeding['*'],

            app: e.App['*'],
            initialAnalysis: e.Analysis['*'],
            secondAnalysis: e.Analysis['*'],
            uploads: e.MessageUpload['*'],
            requestedAnalysis: e.RequestedAnalysis['*'],

            filter: e.op(p.token, 'in', e.set(...proceedingTokens)),
        }))
        .run(client);

    if (proceedings.length === 0) return new Response('Invalid token(s).', { status: 400 });

    const reference = generateReference(new Date());
    const zip = new JSZip();

    for (const proceeding of proceedings) {
        const baseDir = proceedings.length === 1 ? zip : zip.folder(proceeding.token);
        if (!baseDir) throw new Error('This should never happen.');

        if (proceeding.userNetworkActivityRaw || proceeding.uploads.length > 0) {
            const uploadsDir = baseDir.folder('uploads');
            if (!uploadsDir) throw new Error('This should never happen.');

            for (const upload of proceeding.uploads) uploadsDir.file(upload.filename, upload.file);
            if (proceeding.userNetworkActivityRaw)
                uploadsDir.file('user-network-activity', proceeding.userNetworkActivityRaw);
        }

        if (proceeding.initialAnalysis?.har) baseDir.file('initial-analysis.har', proceeding.initialAnalysis.har);
        if (proceeding.secondAnalysis?.har) baseDir.file('second-analysis.har', proceeding.secondAnalysis.har);

        if (dataPortabilityRequest) {
            const p = proceeding as PartialDeep<typeof proceeding>;

            delete p.initialAnalysis?.har;
            delete p.secondAnalysis?.har;
            for (const upload of p.uploads || []) delete (upload as Partial<typeof upload>).file;

            baseDir.file(
                'proceeding.json',
                JSON.stringify(
                    p,
                    (k, v) => {
                        if (v instanceof Uint8Array) return Buffer.from(v).toString('base64');

                        return v;
                    },
                    4,
                ),
            );
        }
    }

    return new Response(await zip.generateAsync({ type: 'nodebuffer' }), {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${reference}-tweasel-access-request.zip"`,
        },
    });
};
