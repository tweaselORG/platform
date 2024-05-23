import AstroGlobal from 'astro:global';
import { getAbsoluteLocaleUrl } from 'astro:i18n';

export const absUrl = (path: string) => getAbsoluteLocaleUrl(AstroGlobal.currentLocale || 'en', path);
