import { createServer } from 'http';
import { mockAnalysisToken } from '../cypress/fixtures/consts';

const port = process.argv[2] || 3000;

const server = createServer((req, res) => {
    if (req.method === 'PUT' && req.url === '/analysis') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', message: 'Analysis started.', token: mockAnalysisToken }));
    }
});

// eslint-disable-next-line no-console
server.listen(port, () => console.log(`Listening on port ${port}`));
