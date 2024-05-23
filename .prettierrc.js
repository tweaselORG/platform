import baseConfig from '@baltpeter/prettier-config' assert { type: 'json' };

/** @type {import('prettier').Config} */
export default {
    ...baseConfig,

    plugins: [...baseConfig.plugins, 'prettier-plugin-astro'],

    overrides: [
        {
            files: '*.astro',
            options: {
                parser: 'astro',
            },
        },
    ],
};
