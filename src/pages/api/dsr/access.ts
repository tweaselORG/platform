import type { APIRoute } from 'astro';
import JSZip from 'jszip';
import type { PartialDeep } from 'type-fest';
import { zfd } from 'zod-form-data';
import bookInfoIcon from '../../../../assets/dsr-templates/book-info.svg?raw';
import typstAccessData from '../../../../assets/dsr-templates/en/access-data.typ?raw';
import typstAccessNoData from '../../../../assets/dsr-templates/en/access-no-data.typ?raw';
import typstProceeding from '../../../../assets/dsr-templates/en/proceeding.typ?raw';
import typstStyleEn from '../../../../assets/dsr-templates/en/style.typ?raw';
import { client, e } from '../../../lib/db';
import { dpas } from '../../../lib/dpas';
import { compileTypst } from '../../../lib/typst';
import { formatDate, generateReference } from '../../../lib/util';
import { zodProceedingTokensStringToArray } from '../../../lib/zod';

const typstTranslations = {
    en: {
        style: typstStyleEn,
        accessNoData: typstAccessNoData,
        accessData: typstAccessData,
        proceeding: typstProceeding,
    },
};

export const POST: APIRoute = async ({ request, currentLocale }) => {
    const typstFiles = typstTranslations[(currentLocale as 'en') || 'en'] || typstTranslations.en;
    const requestDate = new Date();
    const reference = generateReference(new Date());

    const { proceedingTokens, dataPortabilityRequest } = zfd
        .formData({
            proceedingTokens: zfd.text(zodProceedingTokensStringToArray),
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

    if (proceedings.length === 0) {
        const pdf = await compileTypst({
            mainContent: typstFiles.accessNoData,
            additionalFiles: {
                '/book-info.svg': bookInfoIcon,
                '/style.typ': typstFiles.style,
                '/access.json': JSON.stringify({
                    requestDate: formatDate(requestDate, { language: currentLocale }),
                    reference,
                    responseDate: formatDate(new Date(), { language: currentLocale }),
                    proceedingTokens,
                    dataPortabilityRequest,
                }),
            },
        });
        return new Response(pdf, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${reference}-tweasel-access-request.pdf"`,
            },
        });
    }

    const zip = new JSZip();

    for (const proceeding of proceedings) {
        const baseDir = zip.folder(proceeding.token);
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

        const proceedingPdf = await compileTypst({
            mainContent: typstFiles.proceeding,
            additionalFiles: {
                '/style.typ': typstFiles.style,
                '/proceeding.json': JSON.stringify(proceeding),
                '/dpas.json': JSON.stringify(dpas),
            },
        });
        baseDir.file('proceeding.pdf', proceedingPdf);

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

    const letterPdf = await compileTypst({
        mainContent: typstFiles.accessData,
        additionalFiles: {
            '/book-info.svg': bookInfoIcon,
            '/style.typ': typstFiles.style,
            '/access.json': JSON.stringify({
                requestDate: formatDate(requestDate, { language: currentLocale }),
                reference,
                responseDate: formatDate(new Date(), { language: currentLocale }),
                proceedingTokens,
                dataPortabilityRequest,
                allTokensFound: proceedings.length === proceedingTokens.length,
            }),
        },
    });
    zip.file('README.pdf', letterPdf);

    return new Response(await zip.generateAsync({ type: 'nodebuffer' }), {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${reference}-tweasel-access-request.zip"`,
        },
    });
};
