import type { APIRoute } from 'astro';
import { parseNetworkActivityReport } from 'reporthar';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import type { UpdateShape } from '../../../../../dbschema/edgeql-js/update';
import { client, e } from '../../../../lib/db';
import { dpas } from '../../../../lib/dpas';
import { zodProceedingToken } from '../../../../lib/zod';

const complaintQuestionSchema = z.object({
    token: zodProceedingToken,
    question: z.enum([
        'askIsUserOfApp',
        'askAuthority',
        'askComplaintType',
        'askUserNetworkActivity',
        'askLoggedIntoAppStore',
        'askDeviceHasRegisteredSimCard',
        'askDeveloperAddress',
    ]),
});

export const POST: APIRoute = async ({ params, request, redirect }) => {
    const { token, question } = complaintQuestionSchema.parse(params);

    const proceeding = await e
        .select(e.Proceeding, () => ({
            state: true,
            complaintState: true,

            app: {
                appId: true,
                platform: true,
            },

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
        if (answer === 'no') set.complaintType = 'informal';
    } else if (question === 'askAuthority') {
        const { answer } = zfd
            .formData({
                answer: zfd.text(z.enum(Object.keys(dpas) as [string])),
            })
            .parse(await request.formData());

        set.complaintAuthority = answer;
    } else if (question === 'askComplaintType') {
        const { answer } = zfd
            .formData({
                answer: zfd.text(z.enum(['formal', 'informal'])),
            })
            .parse(await request.formData());

        set.complaintType = answer;
    } else if (question === 'askUserNetworkActivity') {
        const { upload } = zfd
            .formData({
                upload: zfd.file(),
            })
            .parse(await request.formData());

        set.userNetworkActivityRaw = new Uint8Array(await upload.arrayBuffer());
        set.userNetworkActivity = parseNetworkActivityReport(
            proceeding.app.platform === 'android' ? 'tracker-control-csv' : 'ios-app-privacy-report-ndjson',
            await upload.text(),
        ).filter(
            (e) =>
                // The `appId` is always `undefined` in the case of single app exports but we do also want to support full
                // exports across all apps.
                e.appId === undefined || e.appId === proceeding.app.appId,
        );
    } else if (question === 'askLoggedIntoAppStore') {
        const { answer } = zfd
            .formData({
                answer: zfd.text(z.enum(['yes', 'no'])),
            })
            .parse(await request.formData());

        set.loggedIntoAppStore = answer === 'yes';
    } else if (question === 'askDeviceHasRegisteredSimCard') {
        const { answer } = zfd
            .formData({
                answer: zfd.text(z.enum(['yes', 'no'])),
            })
            .parse(await request.formData());

        set.deviceHasRegisteredSimCard = answer === 'yes';
    } else if (question === 'askDeveloperAddress') {
        const { developerAddress, developerAddressSourceUrl } = zfd
            .formData({
                developerAddress: zfd.text(),
                developerAddressSourceUrl: zfd.text(),
            })
            .parse(await request.formData());

        set.developerAddress = developerAddress;
        set.developerAddressSourceUrl = developerAddressSourceUrl;
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
