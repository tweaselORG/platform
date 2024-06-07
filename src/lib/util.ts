import AstroGlobal from 'astro:global';
import { getAbsoluteLocaleUrl } from 'astro:i18n';

export const absUrl = (path: string) => getAbsoluteLocaleUrl(AstroGlobal.currentLocale || 'en', path);

export const generateReference = (date: Date): string =>
    date.getFullYear() + '-' + Math.random().toString(36).substring(2, 9).toUpperCase();

export const formatDate = (date: Date, options: { language: Intl.LocalesArgument; includeTime?: boolean }) =>
    date.toLocaleString(options.language, {
        dateStyle: 'long',
        timeStyle: options.includeTime === true ? 'long' : undefined,
    });
