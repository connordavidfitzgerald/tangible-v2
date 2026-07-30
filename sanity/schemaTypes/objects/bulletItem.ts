import { defineField, defineType } from 'sanity';

/** A single translatable list item (e.g. an "Our promise" bullet). */
export const bulletItem = defineType({
    name: 'bulletItem',
    title: 'List Item',
    type: 'object',
    fields: [
        defineField({
            name: 'text',
            title: 'Text',
            type: 'internationalizedArrayString'
        })
    ],
    preview: {
        select: { items: 'text' },
        prepare({ items }) {
            const value = Array.isArray(items) ? items.find((i) => i?._key === 'fr')?.value : '';
            return { title: value || 'List item' };
        }
    }
});
