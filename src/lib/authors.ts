export const authors = {
    baltpeter: {
        name: 'Benjamin Altpeter',
    },
    caro: {
        name: 'Carolin Gaus',
    },
} satisfies Record<string, { name: string; url?: string }>;
