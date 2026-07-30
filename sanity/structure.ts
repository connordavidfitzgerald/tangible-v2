import type { StructureResolver } from 'sanity/structure';
import { SINGLETONS } from './schemaTypes';

/**
 * All content in this project is singletons (one document per page + settings).
 * Each is edited at a fixed document id equal to its type name, so there is no
 * "create new" — just one editable document per page.
 */
export const structure: StructureResolver = (S) =>
    S.list()
        .title('Content')
        .items(
            SINGLETONS.map(({ type, title }) =>
                S.listItem()
                    .id(type)
                    .title(title)
                    .child(S.document().schemaType(type).documentId(type).title(title))
            )
        );
