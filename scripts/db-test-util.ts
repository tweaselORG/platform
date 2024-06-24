import { client, e } from '../src/lib/db';

const command = process.argv[2];

(async () => {
    if (command === 'delete-qd') {
        await e
            .delete(e.Proceeding, (p) => ({
                filter: e.op(p.app.appId, '=', 'se.maginteractive.quizduel2'),
            }))
            .run(client);

        return;
    }

    throw new Error('Unknown command');
})();
