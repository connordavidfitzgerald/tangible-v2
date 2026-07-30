import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { internationalizedArray } from 'sanity-plugin-internationalized-array';
import { muxInput } from 'sanity-plugin-mux-input';

import { schemaTypes, SINGLETONS } from './sanity/schemaTypes';
import { structure } from './sanity/structure';
import { LOCALES } from './sanity/lib/locales';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET;

const singletonTypes = new Set<string>(SINGLETONS.map((s) => s.type));

export default defineConfig({
    name: 'default',
    title: 'Tangible',
    projectId,
    dataset,
    plugins: [
        structureTool({ structure }),
        internationalizedArray({
            languages: [...LOCALES],
            defaultLanguages: ['fr'],
            fieldTypes: ['string', 'text']
        }),
        // Adds the `mux.video` field type. Mux credentials are entered once from
        // the field's settings menu in the Studio and stored in the dataset.
        muxInput(),
        visionTool()
    ],
    schema: {
        types: schemaTypes,
        // Hide singleton types from the global "Create new document" menu.
        templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType))
    },
    document: {
        // Remove create/delete/duplicate actions for singleton documents.
        actions: (actions, { schemaType }) =>
            singletonTypes.has(schemaType)
                ? actions.filter(({ action }) =>
                      ['publish', 'discardChanges', 'restore'].includes(action ?? '')
                  )
                : actions
    }
});
