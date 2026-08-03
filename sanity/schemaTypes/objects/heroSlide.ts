import { defineType } from 'sanity';
import { i18nImage, i18nString } from '../lib/fields';

/**
 * One frame of the home hero. The photo and its three-line title run off the
 * same clock, so they are authored together rather than as two arrays that have
 * to be kept the same length by hand.
 *
 * Leave the whole array empty and the hero falls back to the five drawn photos
 * in `src/assets/images` with the titles in `homeFallbacks.ts`. Fill it in and
 * it takes over wholesale — the first slide's title doubles as the page's `h1`.
 */
export const heroSlide = defineType({
    name: 'heroSlide',
    title: 'Hero Slide',
    type: 'object',
    fields: [
        i18nImage('desktop', 'Photo — wide crop', 'Shown from 810px up.'),
        i18nImage('mobile', 'Photo — phone crop', 'Optional. Falls back to the wide crop.'),
        i18nString('line1', 'Title — Line 1'),
        i18nString('line2', 'Title — Line 2'),
        i18nString('line3', 'Title — Line 3')
    ],
    preview: {
        select: { media: 'desktop', items: 'line1' },
        prepare({ media, items }) {
            const value = Array.isArray(items) ? items.find((i) => i?._key === 'fr')?.value : '';
            return { title: value || 'Hero slide', media };
        }
    }
});
