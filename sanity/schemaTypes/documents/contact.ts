import { defineType } from 'sanity';
import { EnvelopeIcon } from '@sanity/icons';
import { i18nString, i18nText } from '../lib/fields';

export const contact = defineType({
    name: 'contact',
    title: 'Contact Page',
    type: 'document',
    icon: EnvelopeIcon,
    fields: [
        i18nString('heroLine1', 'Hero Line 1'),
        i18nString('heroLine2', 'Hero Line 2'),
        i18nString('heroLine3', 'Hero Line 3'),
        i18nString('heroLine4', 'Hero Line 4 (optional)'),
        i18nText('introBold', 'Intro — Bold sentence'),
        i18nText('introBody', 'Intro — Body'),
        i18nString('email', 'Email address'),
        i18nString('phone', 'Phone number'),
        i18nString('fieldName', 'Form — Name label'),
        i18nString('fieldEmail', 'Form — Email label'),
        i18nString('fieldPhone', 'Form — Phone label'),
        i18nString('fieldMessage', 'Form — Message label'),
        i18nString('checkboxLabel', 'Form — Checkbox label'),
        i18nString('submitButton', 'Form — Submit button')
    ],
    preview: { prepare: () => ({ title: 'Contact Page' }) }
});
