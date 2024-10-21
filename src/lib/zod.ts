import { z } from 'zod';

export const zodProceedingTokensStringToArray = z.string().transform((t) =>
    t
        .split(/[\n\r]/)
        .map((t) => (t.includes('/') ? /\/p\/([A-Za-z0-9_-]+)/.exec(t)?.[1] || '' : t))
        .map((t) => t.trim())
        .filter(Boolean),
);
