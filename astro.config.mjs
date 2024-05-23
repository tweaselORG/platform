import node from '@astrojs/node';
import { defineConfig } from 'astro/config';

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
});
