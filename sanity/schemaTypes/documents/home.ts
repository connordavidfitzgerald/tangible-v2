import { defineField, defineType } from 'sanity';
import { HomeIcon } from '@sanity/icons';
import { i18nImage, i18nString, i18nText } from '../lib/fields';
import { contactFooterFields } from '../lib/contactFooter';
import { seoFields } from '../lib/seo';

export const home = defineType({
    name: 'home',
    title: 'Home Page',
    type: 'document',
    icon: HomeIcon,
    groups: [
        { name: 'seo', title: 'SEO' },
        { name: 'hero', title: 'Hero' },
        { name: 'about', title: 'About' },
        { name: 'programs', title: 'Programs' },
        { name: 'intro', title: 'Intro Band' },
        { name: 'footer', title: 'Footer' }
    ],
    fields: [
        ...seoFields().map((field) => ({ ...field, group: 'seo' })),
        { ...i18nString('heroLine1', 'Hero Line 1'), group: 'hero' },
        { ...i18nString('heroLine2', 'Hero Line 2'), group: 'hero' },
        { ...i18nString('heroLine3', 'Hero Line 3'), group: 'hero' },
        // The hero cycles a set of photos, each carrying its own title on the
        // same clock — so the two are authored together, one entry per frame.
        // The three lines above remain the page's h1 and stand in for the first
        // slide's title when it is left blank.
        defineField({
            name: 'heroSlides',
            title: 'Hero — Slides',
            description:
                'One entry per hero frame: a photo and the title that runs over it. Leave the whole list empty and the hero falls back to the five drawn photos.',
            type: 'array',
            of: [{ type: 'heroSlide' }],
            group: 'hero'
        }),
        { ...i18nString('aboutSectionLabel', 'About — Section Label'), group: 'about' },
        { ...i18nImage('aboutImage', 'About — Photo'), group: 'about' },
        {
            ...i18nText('aboutBody', 'About — Body', 'Follows the bold "Tangible" prefix.'),
            group: 'about'
        },
        {
            ...i18nText(
                'aboutBody2',
                'About — Secondary Body',
                'Renders below the main paragraph. Blank lines become paragraph breaks.'
            ),
            group: 'about'
        },
        { ...i18nString('aboutButton', 'About — Button'), group: 'about' },
        { ...i18nText('missionQuote', 'Mission Quote'), group: 'about' },
        { ...i18nString('programsSectionLabel', 'Programs — Section Label'), group: 'programs' },
        { ...i18nImage('entreprisesImage', 'Entreprises — Photo'), group: 'programs' },
        { ...i18nImage('leadersImage', 'Leaders — Photo'), group: 'programs' },
        { ...i18nString('entreprisesTitle1', 'Entreprises — Title Line 1'), group: 'programs' },
        { ...i18nString('entreprisesTitle2', 'Entreprises — Title Line 2'), group: 'programs' },
        { ...i18nText('entreprisesBody', 'Entreprises — Body'), group: 'programs' },
        { ...i18nString('entreprisesButton', 'Entreprises — Button'), group: 'programs' },
        { ...i18nString('leadersTitle1', 'Leaders — Title Line 1'), group: 'programs' },
        { ...i18nString('leadersTitle2', 'Leaders — Title Line 2'), group: 'programs' },
        { ...i18nText('leadersBody', 'Leaders — Body'), group: 'programs' },
        { ...i18nString('leadersButton', 'Leaders — Button'), group: 'programs' },
        // The perle band between the film and the contact form. Same shape as
        // the contact page's intro, but its own copy — the two are edited
        // independently even where they currently read the same.
        {
            ...i18nText('introBold', 'Intro Band — Lead sentence'),
            group: 'intro'
        },
        { ...i18nText('introBody', 'Intro Band — Body'), group: 'intro' },
        ...contactFooterFields().map((field) => ({ ...field, group: 'footer' }))
    ],
    preview: { prepare: () => ({ title: 'Home Page' }) }
});
