import AstroGlobal from 'astro:global';
import { translate } from 'preact-i18n';
import i18nDefinitionEn from './en.json';

export const i18nDefinitions = {
    en: i18nDefinitionEn,
};

export const t = <ScopeT extends keyof typeof i18nDefinitionEn>(
    scope: ScopeT,
    id: keyof (typeof i18nDefinitionEn)[ScopeT],
    fields?: Record<string, string | number>,
    plural?: number,
    fallback?: string,
) => translate(id as string, scope, i18nDefinitions[AstroGlobal.currentLocale as 'en'], fields, plural, fallback);
