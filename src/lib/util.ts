import AstroGlobal from 'astro:global';
import { getAbsoluteLocaleUrl } from 'astro:i18n';

export const absUrl = (path: string) => getAbsoluteLocaleUrl(AstroGlobal.currentLocale || 'en', path);

export const generateReference = (date: Date): string =>
    date.getFullYear() + '-' + Math.random().toString(36).substring(2, 9).toUpperCase();
