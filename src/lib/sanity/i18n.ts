import { DEFAULT_LOCALE, type LocaleId } from '../i18n/locales';

/** One entry of an `internationalizedArray*` field as stored in Sanity. */
export type I18nEntry = { _key: string; value?: string | null };
export type I18nField = I18nEntry[] | null | undefined;

/**
 * Resolve an internationalized-array field to a single string for the active
 * locale, falling back to the default locale (FR) then to an empty string.
 */
export function pick(field: I18nField, locale: LocaleId): string {
    if (!Array.isArray(field)) return '';
    const match = field.find((e) => e._key === locale)?.value;
    if (match) return match;
    const fallback = field.find((e) => e._key === DEFAULT_LOCALE)?.value;
    return fallback ?? '';
}
