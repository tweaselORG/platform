/* eslint-disable no-console */
import { CronJob } from 'cron';
import { client, e } from './lib/db';

const proceedingCompletedStates = [
    'complaintSent',
    'secondAnalysisFoundNothing',
    'secondAnalysisFailed',
    'initialAnalysisFoundNothing',
    'initialAnalysisFailed',
    'expired',
    'erased',
];

// Garbage collection
new CronJob('08 12 03 * * *', async () => {
    console.log('Running garbage collection...');

    // Proceedings expired after one year.
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const expiredProceedings = await e
        .update(e.Proceeding, (p) => ({
            filter: e.all(
                e.set(
                    e.op(p.state, 'not in', e.set(...proceedingCompletedStates)),
                    e.op(p.createdOn, '<=', oneYearAgo),
                ),
            ),

            set: { expired: e.datetime_current() },
        }))
        .run(client);
    console.log('Expired', expiredProceedings.length, 'proceedings.');

    // Uploads of completed proceedings are deleted after one week.
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const deletedCompletedUploads = await e
        .delete(e.MessageUpload, (u) => ({
            filter: e.all(
                e.set(
                    e.op(u.proceeding.state, 'in', e.set(...proceedingCompletedStates)),
                    e.op(u.proceeding.stateUpdatedOn, '<=', oneWeekAgo),
                ),
            ),
        }))
        .run(client);
    console.log('Deleted', deletedCompletedUploads.length, 'uploads of completed proceedings.');

    console.log('Finished garbage collection.');
    console.log();
}).start();
/* eslint-enable no-console */
