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

/**
 * Tie French punctuation to the word it belongs to.
 *
 * The copy comes out of Sanity with ordinary spaces around `« »` and before
 * `: ; ! ?`, which the browser is free to break at — so a colon or a closing
 * guillemet can start a line on its own. Swapping those single spaces for
 * no-break spaces removes exactly those break points and nothing else; the
 * glyph is the same width, so nothing about the setting changes otherwise.
 *
 * U+00A0 rather than the narrow U+202F French typography calls for: not every
 * face on the site carries the narrow one, and a missing glyph is a worse
 * outcome than a slightly wide space.
 */
export function frenchSpacing(text: string): string {
    return text
        .replace(/«\s+/g, '« ')
        .replace(/\s+»/g, ' »')
        .replace(/\s+([:;!?])/g, ' $1');
}
