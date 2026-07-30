/**
 * One-shot repair for `centreIam.slides[].title`.
 *
 * An earlier import wrote those values as `internationalizedArrayStringValue`
 * while the schema declares the field as text, so the Studio refuses to edit
 * them ("Item of type internationalizedArrayStringValue not valid for this
 * list"). This rewrites the `_type` in place and converts any literal `<br/>`
 * into a real newline, which is what the textarea input and the frontend's
 * `\n` → `<br/>` transform now expect.
 *
 * Only `slides[].title` is touched — every other field is left byte-identical.
 *
 *   npx sanity exec <this file> --with-user-token          # dry run
 *   npx sanity exec <this file> --with-user-token -- --apply
 */
// `sanity/cli` is CJS, so the named export is only reachable through the
// default binding when this file is loaded as an ES module.
import sanityCli from 'sanity/cli';

const { getCliClient } = sanityCli as unknown as {
    getCliClient: (opts?: { apiVersion?: string }) => any;
};

const client = getCliClient({ apiVersion: '2024-01-01' });
const APPLY = process.argv.includes('--apply');

const BAD = 'internationalizedArrayStringValue';
const GOOD = 'internationalizedArrayTextValue';

interface Value {
    _key: string;
    _type: string;
    value?: string | null;
}
interface Slide {
    _key: string;
    title?: Value[] | null;
}

async function run() {
    // Published and draft are separate documents; a stale draft would put the
    // broken values straight back on screen, so both get the same treatment.
    const ids = ['centreIam', 'drafts.centreIam'];
    const docs: { _id: string; slides?: Slide[] }[] = await client.fetch(
        '*[_id in $ids]{_id, slides}',
        { ids }
    );

    if (!docs.length) {
        console.log('No centreIam document found — nothing to do.');
        return;
    }

    for (const doc of docs) {
        const slides = doc.slides ?? [];
        const patched = slides.map((slide) => ({
            ...slide,
            title: (slide.title ?? []).map((v) => ({
                ...v,
                _type: v._type === BAD ? GOOD : v._type,
                value: (v.value ?? '').replace(/<br\s*\/?>/g, '\n')
            }))
        }));

        const changes = patched.flatMap((slide, i) =>
            (slide.title ?? [])
                .map((v, j) => {
                    const before = slides[i].title?.[j];
                    if (!before) return null;
                    if (before._type === v._type && before.value === v.value) return null;
                    return `  [${slide._key}/${v._key}] ${before._type} ${JSON.stringify(
                        before.value
                    )}\n      → ${v._type} ${JSON.stringify(v.value)}`;
                })
                .filter(Boolean)
        );

        console.log(`\n${doc._id}: ${changes.length} value(s) to fix`);
        changes.forEach((c) => console.log(c));

        if (APPLY && changes.length) {
            await client.patch(doc._id).set({ slides: patched }).commit();
            console.log(`  ✓ committed`);
        }
    }

    console.log(APPLY ? '\nDone.' : '\nDry run — re-run with `-- --apply` to write.');
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
