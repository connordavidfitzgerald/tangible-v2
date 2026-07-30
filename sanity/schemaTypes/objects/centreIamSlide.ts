import { defineField, defineType } from 'sanity';

/** A single service slide on the Centre I AM page. */
export const centreIamSlide = defineType({
    name: 'centreIamSlide',
    title: 'Service Slide',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Service Title',
            description: 'Use a line break for a multi-line title.',
            type: 'internationalizedArrayText'
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'internationalizedArrayText'
        })
    ],
    preview: {
        select: { items: 'title' },
        prepare({ items }) {
            const value = Array.isArray(items) ? items.find((i) => i?._key === 'fr')?.value : '';
            return { title: (value || 'Service').replace(/\n/g, ' ') };
        }
    }
});
