import { defineField, defineType } from 'sanity';
import { CaseIcon } from '@sanity/icons';
import { i18nString, i18nText } from '../lib/fields';

export const servicesEntreprises = defineType({
    name: 'servicesEntreprises',
    title: 'Services — Entreprises',
    type: 'document',
    icon: CaseIcon,
    fields: [
        i18nString('heroLine1', 'Hero Line 1'),
        i18nString('heroLine2', 'Hero Line 2'),
        i18nText('introParagraph', 'Intro — Main Paragraph'),
        i18nText('introResult', 'Intro — Result phrase', 'Format: bold : rest'),
        defineField({
            name: 'slides',
            title: 'Slides',
            type: 'array',
            of: [{ type: 'serviceSlide' }]
        }),
        i18nString('contactFooterHeading', 'Contact Footer — Heading')
    ],
    preview: { prepare: () => ({ title: 'Services — Entreprises' }) }
});
