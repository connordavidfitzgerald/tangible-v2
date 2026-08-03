import { defineType } from 'sanity';
import { i18nString } from '../lib/fields';

/**
 * One home-hero title. The hero cycles a fixed set of photos, and each photo
 * carries its own title on the same clock, so entries here line up with the
 * photos by position.
 */
export const heroSlideTitle = defineType({
    name: 'heroSlideTitle',
    title: 'Hero Title',
    type: 'object',
    fields: [
        i18nString('line1', 'Line 1'),
        i18nString('line2', 'Line 2'),
        i18nString('line3', 'Line 3')
    ],
    preview: {
        select: { items: 'line1' },
        prepare({ items }) {
            const value = Array.isArray(items) ? items.find((i) => i?._key === 'fr')?.value : '';
            return { title: value || 'Hero title' };
        }
    }
});
