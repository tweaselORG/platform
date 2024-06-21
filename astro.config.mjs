import node from '@astrojs/node';
import { defineConfig, envField } from 'astro/config';

import preact from '@astrojs/preact';
import global from 'astro-global';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: node({
        mode: 'standalone',
    }),
    integrations: [preact(), global()],
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    experimental: {
        env: {
            schema: {
                ANDROID_RUNNER_API_URL: envField.string({ context: 'server', access: 'public' }),
                ANDROID_RUNNER_TOKEN: envField.string({ context: 'server', access: 'secret' }),
                IOS_RUNNER_API_URL: envField.string({ context: 'server', access: 'public' }),
                IOS_RUNNER_TOKEN: envField.string({ context: 'server', access: 'secret' }),
            },
        },
    },
});
