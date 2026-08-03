import { defineField, defineType } from 'sanity';
import { CaseIcon } from '@sanity/icons';
import { i18nString, i18nText } from '../lib/fields';
import { contactFooterFields } from '../lib/contactFooter';
import { heroImageFields } from '../lib/hero';
import { seoFields } from '../lib/seo';

export const servicesEntreprises = defineType({
    name: 'servicesEntreprises',
    title: 'Services — Entreprises',
    type: 'document',
    icon: CaseIcon,
    groups: [
        { name: 'seo', title: 'SEO' },
        { name: 'hero', title: 'Hero' },
        { name: 'intro', title: 'Intro' },
        { name: 'slides', title: 'Slides' },
        { name: 'footer', title: 'Footer' }
    ],
    fields: [
        ...seoFields().map((field) => ({ ...field, group: 'seo' })),
        ...heroImageFields().map((field) => ({ ...field, group: 'hero' })),
        { ...i18nString('heroLine1', 'Hero Line 1'), group: 'hero' },
        { ...i18nString('heroLine2', 'Hero Line 2'), group: 'hero' },
        { ...i18nText('introParagraph', 'Intro — Main Paragraph'), group: 'intro' },
        {
            ...i18nText(
                'introResult',
                'Intro — Result phrase',
                'Sits under the paragraph. Everything up to the first colon is set in bold — "L’objectif : incarner un leadership…".'
            ),
            group: 'intro'
        },
        defineField({
            name: 'slides',
            title: 'Slides',
            type: 'array',
            of: [{ type: 'serviceSlide' }],
            group: 'slides'
        }),
        ...contactFooterFields().map((field) => ({ ...field, group: 'footer' }))
    ],
    preview: { prepare: () => ({ title: 'Services — Entreprises' }) }
});
