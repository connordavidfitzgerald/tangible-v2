import { defineField, defineType } from 'sanity';
import { UserIcon } from '@sanity/icons';
import { i18nString, i18nText } from '../lib/fields';

export const servicesLeaders = defineType({
    name: 'servicesLeaders',
    title: 'Services — Leaders',
    type: 'document',
    icon: UserIcon,
    fields: [
        i18nString('heroLine1', 'Hero Line 1'),
        i18nString('heroLine2', 'Hero Line 2'),
        i18nText('introParagraph', 'Intro — Paragraph'),
        defineField({
            name: 'slides',
            title: 'Slides',
            type: 'array',
            of: [{ type: 'serviceSlide' }]
        }),
        i18nString('contactFooterHeading', 'Contact Footer — Heading')
    ],
    preview: { prepare: () => ({ title: 'Services — Leaders' }) }
});
