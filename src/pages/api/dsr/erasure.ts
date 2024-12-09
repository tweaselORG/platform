import type { APIRoute } from 'astro';
import { zfd } from 'zod-form-data';
import typstErasureData from '../../../../assets/dsr-templates/en/erasure-data.typ?raw';
import typstErasureNoData from '../../../../assets/dsr-templates/en/erasure-no-data.typ?raw';
import typstStyleEn from '../../../../assets/dsr-templates/en/style.typ?raw';
import { client, e } from '../../../lib/db';
import { compileTypst } from '../../../lib/typst';
import { formatDate, generateReference } from '../../../lib/util';
import { zodProceedingTokensStringToArray } from '../../../lib/zod';

const typstTranslations = {
    en: {
        style: typstStyleEn,
        erasureNoData: typstErasureNoData,
        erasureData: typstErasureData,
    },
};

export const POST: APIRoute = async ({ request, currentLocale }) => {
    const typstFiles = typstTranslations[(currentLocale as 'en') || 'en'] || typstTranslations.en;
    const requestDate = new Date();
    const reference = generateReference(new Date());

    const { proceedingTokens } = zfd
        .formData({
            proceedingTokens: zfd.text(zodProceedingTokensStringToArray),
        })
        .parse(await request.formData());

    const proceedings = await e
        .select(e.Proceeding, (p) => ({
            id: true,
            token: true,

            filter: e.op(p.token, 'in', e.set(...proceedingTokens)),
        }))
        .run(client);

    if (proceedings.length === 0) {
        const pdf = await compileTypst({
            mainContent: typstFiles.erasureNoData,
            additionalFiles: {
                '/style.typ': typstFiles.style,
                '/erasure.json': JSON.stringify({
                    requestDate: formatDate(requestDate, { language: currentLocale }),
                    reference,
                    responseDate: formatDate(new Date(), { language: currentLocale }),
                    proceedingTokens,
                }),
            },
        });
        return new Response(pdf, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${reference}-tweasel-erasure-request.pdf"`,
            },
        });
    }

    await e
        .delete(e.MessageUpload, (u) => ({
            filter: e.op(u.proceeding.token, 'in', e.set(...proceedingTokens)),
        }))
        .run(client);

    await e
        .update(e.Proceeding, (p) => ({
            filter: e.op(p.token, 'in', e.set(...proceedingTokens)),

            set: {
                token: e.cast(e.str, e.uuid_generate_v4()),
                reference: e.cast(e.str, e.uuid_generate_v4()),
                erased: new Date(),

                userNetworkActivity: null,
                userNetworkActivityRaw: null,
            },
        }))
        .run(client);

    const letterPdf = await compileTypst({
        mainContent: typstFiles.erasureData,
        additionalFiles: {
            '/style.typ': typstFiles.style,
            '/erasure.json': JSON.stringify({
                requestDate: formatDate(requestDate, { language: currentLocale }),
                reference,
                responseDate: formatDate(new Date(), { language: currentLocale }),
                proceedingTokens,
                allTokensFound: proceedings.length === proceedingTokens.length,
                tokensNotFound: proceedingTokens.filter((token) => !proceedings.some((p) => p.token === token)),
            }),
        },
    });

    return new Response(letterPdf, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${reference}-tweasel-access-request.zip"`,
        },
    });
};
