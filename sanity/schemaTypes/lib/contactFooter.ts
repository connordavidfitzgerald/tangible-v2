import { i18nString, i18nText } from './fields';

/**
 * The band that closes every page except Contact (which *is* the form).
 *
 * Two components draw it — `ContactFooter` on the pages that carry the full
 * two-step form, `ContactFooterAlt` on About and Centre I AM, which close on a
 * button through to the services page instead — and both read the same three
 * strings, so one field set covers the pair.
 *
 * All three are optional. Each falls back to the shared copy under Site
 * Settings → Contact Footer, which is what a page with nothing particular to
 * say should do; filling one in overrides it for that page alone.
 */
export const contactFooterFields = () => [
    i18nString(
        'contactFooterHeading',
        'Contact Footer — Heading',
        'Falls back to the default under Site Settings → Contact Footer.'
    ),
    i18nText(
        'contactFooterParagraph',
        'Contact Footer — Paragraph',
        'The paragraph under the heading, on the wide layout. Falls back to the shared default.'
    ),
    i18nText(
        'contactFooterMobBody',
        'Contact Footer — Paragraph (phone layout)',
        'The phone frame runs the paragraph and the line under it together as one block. Blank lines become paragraph breaks. Falls back to the shared default.'
    )
];
