import { defineField, defineType } from 'sanity';
import { UsersIcon } from '@sanity/icons';
import { i18nImage, i18nString, i18nText } from '../lib/fields';
import { contactFooterFields } from '../lib/contactFooter';
import { seoFields } from '../lib/seo';

export const about = defineType({
    name: 'about',
    title: 'About Page',
    type: 'document',
    icon: UsersIcon,
    groups: [
        { name: 'seo', title: 'SEO' },
        { name: 'hero', title: 'Hero' },
        { name: 'intro', title: 'Intro' },
        { name: 'approach', title: 'Approach' },
        { name: 'vision', title: 'Vision' },
        { name: 'promise', title: 'Promise' },
        { name: 'founder', title: 'Founder' },
        { name: 'footer', title: 'Footer' }
    ],
    fields: [
        ...seoFields().map((field) => ({ ...field, group: 'seo' })),
        { ...i18nString('heroSectionLabel', 'Hero — Section Label'), group: 'hero' },
        { ...i18nString('heroLine1', 'Hero Line 1'), group: 'hero' },
        { ...i18nString('heroLine2', 'Hero Line 2'), group: 'hero' },
        { ...i18nString('heroLine3', 'Hero Line 3'), group: 'hero' },
        { ...i18nString('heroLine4', 'Hero Line 4 (optional)'), group: 'hero' },
        {
            ...i18nText(
                'introParagraph1',
                'Intro — Paragraph 1',
                'Follows the bold "Tangible" prefix.'
            ),
            group: 'intro'
        },
        { ...i18nText('introParagraph2', 'Intro — Paragraph 2'), group: 'intro' },
        { ...i18nString('approachSectionLabel', 'Approach — Section Label'), group: 'approach' },
        { ...i18nString('circleLabel1', 'Circle 1 Label'), group: 'approach' },
        { ...i18nString('circleLabel2', 'Circle 2 Label'), group: 'approach' },
        { ...i18nString('circleLabel3', 'Circle 3 Label'), group: 'approach' },
        // One caption per circle, in the same order. Three fields rather than an
        // array because the layout places each line under its own disc — there
        // is no fourth position for a fourth line to go.
        { ...i18nText('approachLine1', 'Circle 1 — Caption'), group: 'approach' },
        { ...i18nText('approachLine2', 'Circle 2 — Caption'), group: 'approach' },
        { ...i18nText('approachLine3', 'Circle 3 — Caption'), group: 'approach' },
        { ...i18nString('visionSectionLabel', 'Vision — Section Label'), group: 'vision' },
        { ...i18nText('visionQuote', 'Vision — Quote'), group: 'vision' },
        { ...i18nString('promiseSectionLabel', 'Promise — Section Label'), group: 'promise' },
        { ...i18nString('promiseIntro', 'Promise — Intro line'), group: 'promise' },
        defineField({
            name: 'promiseItems',
            title: 'Promise Items',
            type: 'array',
            of: [{ type: 'bulletItem' }],
            group: 'promise'
        }),
        { ...i18nImage('ronImage', 'Founder — Portrait'), group: 'founder' },
        { ...i18nString('ronName', 'Founder — Name'), group: 'founder' },
        {
            ...i18nText('ronTitle', 'Founder — Title', 'Use a line break for two lines.'),
            group: 'founder'
        },
        {
            ...i18nText('ronBio', 'Founder — Bio', 'Separate paragraphs with a blank line.'),
            group: 'founder'
        },
        ...contactFooterFields().map((field) => ({ ...field, group: 'footer' }))
    ],
    preview: { prepare: () => ({ title: 'About Page' }) }
});
