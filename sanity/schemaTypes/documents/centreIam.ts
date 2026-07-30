import { defineField, defineType } from 'sanity';
import { SparklesIcon } from '@sanity/icons';
import { i18nString, i18nText } from '../lib/fields';

export const centreIam = defineType({
    name: 'centreIam',
    title: 'Centre I AM Page',
    type: 'document',
    icon: SparklesIcon,
    fields: [
        i18nString('heroLine1', 'Hero Line 1'),
        i18nString('heroLine2', 'Hero Line 2'),
        i18nString('heroLine3', 'Hero Line 3'),
        i18nString('heroLine4', 'Hero Line 4 (optional)'),
        i18nString('aboutSectionLabel', 'About — Section Label'),
        i18nText('aboutBody', 'About — Body', 'Separate paragraphs with a blank line.'),
        i18nText(
            'aboutBodyParagraph',
            'About — Body Paragraph',
            'Optional. Sits below the body, set larger.'
        ),
        i18nString('servicesSectionLabel', 'Services — Section Label'),
        defineField({
            name: 'slides',
            title: 'Service Slides',
            type: 'array',
            of: [{ type: 'centreIamSlide' }]
        }),
        i18nString('contactFooterHeading', 'Contact Footer — Heading')
    ],
    preview: { prepare: () => ({ title: 'Centre I AM Page' }) }
});
