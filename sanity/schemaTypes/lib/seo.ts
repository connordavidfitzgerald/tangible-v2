import { i18nString } from './fields';

/**
 * What a page says about itself in the browser tab, in search results and when
 * it is linked somewhere. Every page document carries this pair.
 *
 * Both are optional: the title falls back to the site name alone and the
 * description to the default under Site Settings → SEO, which is what a page
 * with nothing particular to say should do.
 */
export const seoFields = () => [
    i18nString(
        'metaTitle',
        'Browser tab title',
        'The site name is appended automatically — "About" becomes "About — Tangible".'
    ),
    i18nString(
        'metaDescription',
        'Search / share description',
        'Around 150 characters. Falls back to the site default.'
    )
];
