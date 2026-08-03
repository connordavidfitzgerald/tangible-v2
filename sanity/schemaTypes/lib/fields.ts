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

/**
 * A photograph, with its alt text translated alongside it.
 *
 * Every image on the site has a drawn default committed in `src/assets/images`,
 * and the frontend falls back to it whenever this field is empty — the same
 * arrangement `video.ts` has with its playback id. So an image field is safe to
 * leave blank; filling it in replaces the default from then on.
 */
export const i18nImage = (name: string, title: string, description?: string) =>
    defineField({
        name,
        title,
        description,
        type: 'image',
        options: { hotspot: true },
        fields: [
            i18nString(
                'alt',
                'Alt text',
                'Describes the photo for screen readers. Leave blank for a decorative image.'
            )
        ]
    });

/** A translatable list of short options (radio choices, list items…). */
export const i18nOptions = (name: string, title: string, description?: string) =>
    defineField({
        name,
        title,
        description,
        type: 'array',
        of: [{ type: 'bulletItem' }]
    });
