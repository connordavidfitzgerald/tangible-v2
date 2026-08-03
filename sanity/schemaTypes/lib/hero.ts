import { i18nImage } from './fields';

/**
 * The full-bleed photo behind a page hero. It is art-directed rather than merely
 * resized — the wide frame and the phone frame are different crops of the same
 * picture — so the two files are separate and swap at 810px.
 *
 * Both are optional: each page ships a drawn default in `src/assets/images` and
 * falls back to it while the field is empty.
 */
export const heroImageFields = () => [
    i18nImage('heroImage', 'Hero — Photo (wide crop)', 'Shown from 810px up.'),
    i18nImage(
        'heroImageMobile',
        'Hero — Photo (phone crop)',
        'Optional. Falls back to the wide crop.'
    )
];
