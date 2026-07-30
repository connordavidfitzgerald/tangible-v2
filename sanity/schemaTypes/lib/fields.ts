import { defineField } from 'sanity';

/** A single-line translatable field (FR + EN together). */
export const i18nString = (name: string, title: string, description?: string) =>
    defineField({
        name,
        title,
        description,
        type: 'internationalizedArrayString'
    });

/** A multi-line translatable field (FR + EN together). */
export const i18nText = (name: string, title: string, description?: string) =>
    defineField({
        name,
        title,
        description,
        type: 'internationalizedArrayText'
    });
