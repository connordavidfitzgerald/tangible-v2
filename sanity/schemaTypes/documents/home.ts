import { defineField, defineType } from 'sanity';
import { HomeIcon } from '@sanity/icons';
import { i18nString, i18nText } from '../lib/fields';

export const home = defineType({
    name: 'home',
    title: 'Home Page',
    type: 'document',
    icon: HomeIcon,
    groups: [
        { name: 'hero', title: 'Hero' },
        { name: 'about', title: 'About' },
        { name: 'programs', title: 'Programs' },
        { name: 'intro', title: 'Intro Band' },
        { name: 'footer', title: 'Footer' }
    ],
    fields: [
        { ...i18nString('heroLine1', 'Hero Line 1'), group: 'hero' },
        { ...i18nString('heroLine2', 'Hero Line 2'), group: 'hero' },
        { ...i18nString('heroLine3', 'Hero Line 3'), group: 'hero' },
        // The hero cycles five photos. The three lines above are the first
        // photo's title (and the page's h1); the rest are authored here, in the
        // order the photos appear.
        defineField({
            name: 'heroTitles',
            title: 'Hero — Title per photo',
            description:
                'One title per hero photo, from the second photo onward. Leave an entry blank and that photo falls back to the drawn default.',
            type: 'array',
            of: [{ type: 'heroSlideTitle' }],
            group: 'hero'
        }),
        { ...i18nString('aboutSectionLabel', 'About — Section Label'), group: 'about' },
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
        { ...i18nString('entreprisesTitle1', 'Entreprises — Title Line 1'), group: 'programs' },
        { ...i18nString('entreprisesTitle2', 'Entreprises — Title Line 2'), group: 'programs' },
        { ...i18nText('entreprisesBody', 'Entreprises — Body'), group: 'programs' },
        {
            ...i18nString('entreprisesResult', 'Entreprises — Result phrase', 'Format: bold : rest'),
            group: 'programs'
        },
        { ...i18nString('entreprisesButton', 'Entreprises — Button'), group: 'programs' },
        { ...i18nString('leadersTitle1', 'Leaders — Title Line 1'), group: 'programs' },
        { ...i18nString('leadersTitle2', 'Leaders — Title Line 2'), group: 'programs' },
        { ...i18nText('leadersBody', 'Leaders — Body'), group: 'programs' },
        {
            ...i18nString('leadersAmbition', 'Leaders — Ambition phrase', 'Format: bold : rest'),
            group: 'programs'
        },
        { ...i18nString('leadersButton', 'Leaders — Button'), group: 'programs' },
        // The perle band between the film and the contact form. Same shape as
        // the contact page's intro, but its own copy — the two are edited
        // independently even where they currently read the same.
        {
            ...i18nText('introBold', 'Intro Band — Lead sentence'),
            group: 'intro'
        },
        { ...i18nText('introBody', 'Intro Band — Body'), group: 'intro' },
        { ...i18nString('contactFooterHeading', 'Contact Footer — Heading'), group: 'footer' }
    ],
    preview: { prepare: () => ({ title: 'Home Page' }) }
});
