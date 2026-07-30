/**
 * Single source of truth for the site's locales.
 * Shared between the Studio (internationalized-array plugin, structure) and,
 * via `src/lib/i18n`, the Astro frontend.
 */
export const LOCALES = [
    { id: 'fr', title: 'Français' },
    { id: 'en', title: 'English' }
] as const;

export type LocaleId = (typeof LOCALES)[number]['id'];

export const DEFAULT_LOCALE: LocaleId = 'fr';

export const LOCALE_IDS = LOCALES.map((l) => l.id) as LocaleId[];
