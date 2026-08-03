import { defineField, defineType } from 'sanity';
import { SparklesIcon } from '@sanity/icons';
import { i18nImage, i18nString, i18nText } from '../lib/fields';
import { contactFooterFields } from '../lib/contactFooter';
import { heroImageFields } from '../lib/hero';
import { seoFields } from '../lib/seo';

export const centreIam = defineType({
    name: 'centreIam',
    title: 'Centre I AM Page',
    type: 'document',
    icon: SparklesIcon,
    groups: [
        { name: 'seo', title: 'SEO' },
        { name: 'hero', title: 'Hero' },
        { name: 'about', title: 'About' },
        { name: 'venue', title: 'The Venue' },
        { name: 'services', title: 'Services' },
        { name: 'footer', title: 'Footer' }
    ],
    fields: [
        ...seoFields().map((field) => ({ ...field, group: 'seo' })),
        ...heroImageFields().map((field) => ({ ...field, group: 'hero' })),
        { ...i18nString('heroLine1', 'Hero Line 1'), group: 'hero' },
        { ...i18nString('heroLine2', 'Hero Line 2'), group: 'hero' },
        { ...i18nString('heroLine3', 'Hero Line 3'), group: 'hero' },
        { ...i18nString('heroLine4', 'Hero Line 4 (optional)'), group: 'hero' },
        { ...i18nString('aboutSectionLabel', 'About — Section Label'), group: 'about' },
        { ...i18nImage('aboutImage', 'About — Photo'), group: 'about' },
        {
            ...i18nText('aboutBody', 'About — Body', 'Separate paragraphs with a blank line.'),
            group: 'about'
        },
        {
            ...i18nText(
                'aboutBodyParagraph',
                'About — Body Paragraph',
                'Optional. Sits below the body, set larger.'
            ),
            group: 'about'
        },
        // The bronze band: the room itself, and the form to book it.
        { ...i18nString('venueSectionLabel', 'Venue — Section Label'), group: 'venue' },
        { ...i18nImage('venueImage', 'Venue — Photo'), group: 'venue' },
        { ...i18nText('venueBody', 'Venue — Body'), group: 'venue' },
        {
            ...i18nString(
                'bookingHeading',
                'Booking form — Heading',
                'The line above the booking form. Its field labels are shared, under Site Settings → Forms.'
            ),
            group: 'venue'
        },
        {
            ...i18nString(
                'bookingMessageLabel',
                'Booking form — Event description label',
                'This one field is particular to the Centre, so it is authored here rather than with the shared form labels.'
            ),
            group: 'venue'
        },
        { ...i18nString('servicesSectionLabel', 'Services — Section Label'), group: 'services' },
        defineField({
            name: 'slides',
            title: 'Service Slides',
            type: 'array',
            of: [{ type: 'centreIamSlide' }],
            group: 'services'
        }),
        ...contactFooterFields().map((field) => ({ ...field, group: 'footer' }))
    ],
    preview: { prepare: () => ({ title: 'Centre I AM Page' }) }
});
