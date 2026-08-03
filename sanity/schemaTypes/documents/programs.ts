import { defineType } from 'sanity';
import { ThLargeIcon } from '@sanity/icons';
import { i18nImage, i18nString, i18nText } from '../lib/fields';
import { contactFooterFields } from '../lib/contactFooter';
import { seoFields } from '../lib/seo';

export const programs = defineType({
    name: 'programs',
    title: 'Programs Page',
    type: 'document',
    icon: ThLargeIcon,
    groups: [
        { name: 'seo', title: 'SEO' },
        { name: 'intro', title: 'Intro' },
        { name: 'entreprises', title: 'Entreprises' },
        { name: 'leaders', title: 'Leaders' },
        { name: 'quote', title: 'Quote' },
        { name: 'footer', title: 'Footer' }
    ],
    fields: [
        ...seoFields().map((field) => ({ ...field, group: 'seo' })),
        { ...i18nText('pageTitle', 'Page Title'), group: 'intro' },
        {
            ...i18nText('pageIntro', 'Page Intro', 'The paragraph under the page title.'),
            group: 'intro'
        },
        { ...i18nImage('entreprisesImage', 'Entreprises — Photo'), group: 'entreprises' },
        { ...i18nString('entreprisesTitle1', 'Entreprises — Title Line 1'), group: 'entreprises' },
        { ...i18nString('entreprisesTitle2', 'Entreprises — Title Line 2'), group: 'entreprises' },
        {
            ...i18nText(
                'entreprisesBody',
                'Entreprises — Body',
                'One line per bullet — each is drawn with a leading dash.'
            ),
            group: 'entreprises'
        },
        { ...i18nString('entreprisesButton', 'Entreprises — Button'), group: 'entreprises' },
        { ...i18nImage('leadersImage', 'Leaders — Photo'), group: 'leaders' },
        { ...i18nString('leadersTitle1', 'Leaders — Title Line 1'), group: 'leaders' },
        { ...i18nString('leadersTitle2', 'Leaders — Title Line 2'), group: 'leaders' },
        {
            ...i18nText(
                'leadersBody',
                'Leaders — Body',
                'One line per bullet — each is drawn with a leading dash.'
            ),
            group: 'leaders'
        },
        { ...i18nString('leadersButton', 'Leaders — Button'), group: 'leaders' },
        { ...i18nText('quote', 'Quote'), group: 'quote' },
        { ...i18nString('quoteAuthor', 'Quote Author'), group: 'quote' },
        ...contactFooterFields().map((field) => ({ ...field, group: 'footer' }))
    ],
    preview: { prepare: () => ({ title: 'Programs Page' }) }
});
