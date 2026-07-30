import { defineType } from 'sanity';
import { ThLargeIcon } from '@sanity/icons';
import { i18nString, i18nText } from '../lib/fields';

export const programs = defineType({
    name: 'programs',
    title: 'Programs Page',
    type: 'document',
    icon: ThLargeIcon,
    fields: [
        i18nText('pageTitle', 'Page Title'),
        i18nString('entreprisesTitle1', 'Entreprises — Title Line 1'),
        i18nString('entreprisesTitle2', 'Entreprises — Title Line 2'),
        i18nText('entreprisesBody', 'Entreprises — Body'),
        i18nString('entreprisesResult', 'Entreprises — Result phrase', 'Format: bold : rest'),
        i18nString('entreprisesButton', 'Entreprises — Button'),
        i18nString('leadersTitle1', 'Leaders — Title Line 1'),
        i18nString('leadersTitle2', 'Leaders — Title Line 2'),
        i18nText('leadersBody', 'Leaders — Body'),
        i18nString('leadersAmbition', 'Leaders — Ambition phrase', 'Format: bold : rest'),
        i18nString('leadersButton', 'Leaders — Button'),
        i18nText('quote', 'Quote'),
        i18nString('quoteAuthor', 'Quote Author'),
        i18nString('contactFooterHeading', 'Contact Footer — Heading')
    ],
    preview: { prepare: () => ({ title: 'Programs Page' }) }
});
