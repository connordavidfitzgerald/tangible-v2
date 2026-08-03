import { defineType } from 'sanity';
import { EnvelopeIcon } from '@sanity/icons';
import { i18nString, i18nText } from '../lib/fields';
import { heroImageFields } from '../lib/hero';
import { seoFields } from '../lib/seo';

/**
 * The form's field labels and options are *not* here — the same form is drawn on
 * the Centre I AM page and in the contact footer of every other page, so it is
 * authored once under Site Settings → Forms.
 *
 * Nor is there a contact-footer group: this page *is* the form, so it is the one
 * page that does not close on the band.
 */
export const contact = defineType({
    name: 'contact',
    title: 'Contact Page',
    type: 'document',
    icon: EnvelopeIcon,
    groups: [
        { name: 'seo', title: 'SEO' },
        { name: 'hero', title: 'Hero' },
        { name: 'intro', title: 'Intro' },
        { name: 'form', title: 'Form' }
    ],
    fields: [
        ...seoFields().map((field) => ({ ...field, group: 'seo' })),
        ...heroImageFields().map((field) => ({ ...field, group: 'hero' })),
        { ...i18nString('heroLine1', 'Hero Line 1'), group: 'hero' },
        { ...i18nString('heroLine2', 'Hero Line 2'), group: 'hero' },
        { ...i18nString('heroLine3', 'Hero Line 3'), group: 'hero' },
        { ...i18nString('heroLine4', 'Hero Line 4 (optional)'), group: 'hero' },
        { ...i18nText('introBold', 'Intro — Bold sentence'), group: 'intro' },
        { ...i18nText('introBody', 'Intro — Body'), group: 'intro' },
        {
            ...i18nString(
                'formHeading',
                'Form — Heading',
                'The line above the form. Its field labels are shared, under Site Settings → Forms.'
            ),
            group: 'form'
        }
    ],
    preview: { prepare: () => ({ title: 'Contact Page' }) }
});
