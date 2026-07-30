import { DEFAULT_LOCALE, LOCALE_IDS, type LocaleId } from './locales';

/** Detect the active locale from the URL path (`/en/...` → 'en', else default). */
export function getLocale(url: URL): LocaleId {
    const [, maybeLang] = url.pathname.split('/');
    return LOCALE_IDS.includes(maybeLang as LocaleId) ? (maybeLang as LocaleId) : DEFAULT_LOCALE;
}

/**
 * Rewrite a path for a target locale.
 * The default locale is served without a prefix; others are prefixed (`/en/...`).
 */
export function localizedPath(path: string, locale: LocaleId): string {
    // Normalise: strip leading/trailing slashes and any existing locale prefix.
    let clean = path.replace(/^\//, '').replace(/\/$/, '');
    for (const id of LOCALE_IDS) {
        if (clean === id) clean = '';
        else if (clean.startsWith(`${id}/`)) clean = clean.slice(id.length + 1);
    }

    const next = locale === DEFAULT_LOCALE ? `/${clean}` : `/${locale}/${clean}`;
    if (next === '/' || next === '//') return '/';
    return next.replace(/\/$/, '');
}

/** The "other" locale, for the language-switch link. */
export function otherLocale(locale: LocaleId): LocaleId {
    return locale === 'en' ? 'fr' : 'en';
}
