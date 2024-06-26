import { defineConfig } from 'cypress';

export default defineConfig({
    projectId: 'aqhwyr',

    viewportWidth: 1920,
    viewportHeight: 1080,

    defaultCommandTimeout: 15000,
    retries: 3,

    e2e: {
        baseUrl: 'http://localhost:4321',
    },
});
