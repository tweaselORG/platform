import { translate } from 'preact-i18n';
import type i18nDefinitionEn from './en.json';

export const t = <ScopeT extends keyof typeof i18nDefinitionEn>(
    scope: ScopeT,
    id: keyof (typeof i18nDefinitionEn)[ScopeT] & `${string}!`,
    fields?: Record<string, string | number>,
    plural?: number,
    fallback?: string,
) =>
    translate(
        id as string,
        scope,
        (window as Window & typeof globalThis & { I18N_DEFINITION: Record<string, Record<string, string>> })
            .I18N_DEFINITION,
        fields,
        plural,
        fallback,
    );
