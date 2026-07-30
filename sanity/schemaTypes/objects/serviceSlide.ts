import { defineField, defineType } from 'sanity';

/**
 * A single slide in the Services (Entreprises / Leaders) slider.
 *
 * The right-hand pane is two paragraphs: `body` runs untitled at the top and
 * stretches to fill the slide, `result` sits below under a fixed "Résultat" /
 * "Result" heading. That heading comes from the active locale on the frontend
 * rather than being authored here, so it reads the same on every slide.
 */
export const serviceSlide = defineType({
    name: 'serviceSlide',
    title: 'Slide',
    type: 'object',
    fields: [
        defineField({
            name: 'shapeTitle',
            title: 'Shape Title',
            description: 'Use a line break for the two-line title.',
            type: 'internationalizedArrayText'
        }),
        defineField({
            name: 'body',
            title: 'Paragraph',
            description: 'Runs untitled at the top of the slide and grows to fill it.',
            type: 'internationalizedArrayText'
        }),
        defineField({
            name: 'result',
            title: 'Result',
            description: 'Shown below, under a "Résultat" / "Result" heading.',
            type: 'internationalizedArrayText'
        })
    ],
    preview: {
        select: { items: 'shapeTitle' },
        prepare({ items }) {
            const value = Array.isArray(items) ? items.find((i) => i?._key === 'fr')?.value : '';
            return { title: (value || 'Slide').replace(/\n/g, ' ') };
        }
    }
});
