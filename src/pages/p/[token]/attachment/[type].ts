import type { APIRoute } from 'astro';
import { generate } from 'reporthar';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { t } from '../../../../i18n/server';
import { client, e } from '../../../../lib/db';

export const GET: APIRoute = async ({ params, currentLocale }) => {
    const { token, type } = z
        .object({
            token: z.string(),
            type: z.enum(['initial-har', 'initial-report', 'notice', 'second-har', 'second-report']),
        })
        .parse(params);

    const proceeding = await e
        .select(e.Proceeding, () => ({
            reference: true,
            state: true,
            complaintState: true,

            initialAnalysis: {
                har: true,
                trackHarResult: true,
            },
            secondAnalysis: {
                har: true,
                trackHarResult: true,
            },

            // eslint-disable-next-line camelcase
            filter_single: { token },
        }))
        .assert_single()
        .run(client);
    if (!proceeding?.initialAnalysis) return new Response('Invalid token.', { status: 403 });

    switch (type) {
        case 'initial-har':
        case 'second-har': {
            if (
                (type === 'initial-har' && proceeding.state !== 'awaitingControllerNotice') ||
                (type === 'second-har' && proceeding.complaintState !== 'readyToSend')
            )
                return new Response('You cannot download this file yet/anymore.', { status: 400 });

            return new Response(
                type === 'initial-har' ? proceeding.initialAnalysis.har : proceeding.secondAnalysis?.har,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Disposition': `attachment; filename="${proceeding.reference}-traffic.har"`,
                    },
                },
            );
        }
        case 'initial-report':
        case 'second-report':
        case 'notice': {
            if (
                (type === 'second-report' && proceeding.complaintState !== 'readyToSend') ||
                (type !== 'second-report' && proceeding.state !== 'awaitingControllerNotice')
            )
                return new Response('You cannot download this file yet/anymore.', { status: 400 });

            const docType = type === 'notice' ? 'notice' : 'report';
            const pdf = await generate({
                type: docType,
                language: currentLocale as 'en',

                har: JSON.parse(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    type === 'second-report' ? proceeding.secondAnalysis!.har : proceeding.initialAnalysis.har,
                ),
                trackHarResult: (type === 'second-report'
                    ? proceeding.secondAnalysis?.trackHarResult
                    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      proceeding.initialAnalysis.trackHarResult) as any,
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

export const POST: APIRoute = async ({ params, currentLocale, request }) => {
    const { token } = z
        .object({
            token: z.string(),
            type: z.enum(['complaint']),
        })
        .parse(params);

    const { complainantAddress, complainantContactDetails, complainantAgreesToUnencryptedCommunication } = zfd
        .formData({
            complainantAddress: zfd.text(),
            complainantContactDetails: zfd.text(),
            complainantAgreesToUnencryptedCommunication: zfd.text(z.enum(['yes', 'no'])),
        })
        .parse(await request.formData());

    const proceeding = await e
        .select(e.Proceeding, () => ({
            complainantIsUserOfApp: true,
            complaintState: true,
            complaintType: true,
            controllerResponse: true,
            developerAddress: true,
            developerAddressSourceUrl: true,
            developerName: true,
            deviceHasRegisteredSimCard: true,
            loggedIntoAppStore: true,
            noticeSent: true,
            reference: true,
            userNetworkActivity: true,

            app: {
                platform: true,
            },

            initialAnalysis: {
                har: true,
                trackHarResult: true,
            },
            secondAnalysis: {
                har: true,
                trackHarResult: true,
            },

            // eslint-disable-next-line camelcase
            filter_single: { token },
        }))
        .assert_single()
        .run(client);

    if (!proceeding) return new Response('Invalid token.', { status: 403 });
    if (
        !proceeding.initialAnalysis ||
        !proceeding.secondAnalysis ||
        !proceeding.noticeSent ||
        !proceeding.developerAddress ||
        !proceeding.developerAddressSourceUrl ||
        !proceeding.controllerResponse
    )
        throw new Error('This should never happen.');
    if (proceeding.complaintState !== 'readyToSend')
        return new Response('You cannot download this file yet/anymore.', { status: 400 });

    const pdf = await generate({
        type: (proceeding.complaintType === 'formal' ? 'complaint' : 'complaint-informal') as 'complaint',
        language: currentLocale as 'en',

        initialHar: JSON.parse(proceeding.initialAnalysis.har),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialTrackHarResult: proceeding.initialAnalysis.trackHarResult as any,
        har: JSON.parse(proceeding.secondAnalysis.har),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        trackHarResult: proceeding.secondAnalysis.trackHarResult as any,

        complaintOptions: {
            date: new Date(),
            reference: proceeding.reference,
            noticeDate: proceeding.noticeSent,

            nationalEPrivacyLaw: false,

            complainantAddress: complainantAddress.replace(/\n|\r\n/g, ', '),
            controllerAddress: proceeding.developerName + ', ' + proceeding.developerAddress.replace(/\n|\r\n/g, ', '),
            controllerAddressSourceUrl: proceeding.developerAddressSourceUrl,

            userDeviceAppStore: t('common', `store-${proceeding.app.platform}`),
            loggedIntoAppStore: !!proceeding.loggedIntoAppStore,
            deviceHasRegisteredSimCard: !!proceeding.deviceHasRegisteredSimCard,

            controllerResponse:
                proceeding.controllerResponse === 'promise' ? 'broken-promise' : proceeding.controllerResponse,

            complainantContactDetails: complainantContactDetails,
            complainantAgreesToUnencryptedCommunication: complainantAgreesToUnencryptedCommunication === 'yes',

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            userNetworkActivity: proceeding.userNetworkActivity as any,
        },
    });

    return new Response(pdf, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${proceeding.reference}-complaint.pdf"`,
        },
    });
};
