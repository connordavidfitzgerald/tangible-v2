/**
 * Fills in the English side of fields that were published in French only.
 *
 *   npx tsx sanity/migrations/fill-translations.ts            # dry run
 *   npx tsx sanity/migrations/fill-translations.ts --apply    # write
 *
 * Strictly additive. A field that already carries an English value is left
 * exactly as it is, so the script is safe to re-run and cannot overwrite an
 * editor's wording — the only thing it ever does is turn an empty `en` entry
 * into a filled one. The copy itself lives in `translations.ts`.
 *
 * Needs write access: `SANITY_API_WRITE_TOKEN` in `.env`, or a `sanity login`
 * session, whose token is picked up from the CLI config.
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { LINE_BREAK_FIXES, SEEDS, TRANSLATIONS } from './translations';

const APPLY = process.argv.includes('--apply');
/** The line-break corrections replace existing English, so they are opt-in. */
const FIX_LINE_BREAKS = process.argv.includes('--fix-line-breaks');
/** Ditto the seeds, which write French as well and so are not translation work. */
const SEED = process.argv.includes('--seed');

// ── Config ──────────────────────────────────────────────────────────────────
/** Minimal `.env` reader — this runs under tsx, outside Vite's env loading. */
function readEnv(): Record<string, string> {
    try {
        const out: Record<string, string> = {};
        for (const line of readFileSync('.env', 'utf-8').split('\n')) {
            const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/.exec(line);
            if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
        }
        return out;
    } catch {
        return {};
    }
}

/** The token `sanity login` leaves behind, used when none is set explicitly. */
function cliToken(): string | undefined {
    try {
        const cfg = JSON.parse(
            readFileSync(join(homedir(), '.config', 'sanity', 'config.json'), 'utf-8')
        );
        return cfg.authToken;
    } catch {
        return undefined;
    }
}

const env = { ...readEnv(), ...process.env };
const token = env.SANITY_API_WRITE_TOKEN || cliToken();

if (!token) {
    console.error('No write token. Set SANITY_API_WRITE_TOKEN in .env, or run `sanity login`.');
    process.exit(1);
}

const client = createClient({
    projectId: env.PUBLIC_SANITY_PROJECT_ID,
    dataset: env.PUBLIC_SANITY_DATASET,
    apiVersion: '2024-01-01',
    useCdn: false,
    token
});

// ── Field paths ─────────────────────────────────────────────────────────────
type I18nEntry = { _key: string; _type?: string; value?: string };

/**
 * Resolve a path like `slides[2].result` against a document, returning the
 * object that holds the internationalized array and the key it sits under —
 * so the caller can replace the array in place.
 */
function locate(doc: any, path: string): { holder: any; key: string } | null {
    const steps = path.split('.');
    let node = doc;

    for (let i = 0; i < steps.length; i++) {
        const m = /^([A-Za-z0-9_]+)(?:\[(\d+)\])?$/.exec(steps[i]);
        if (!m) return null;
        const [, name, index] = m;

        if (i === steps.length - 1 && index === undefined) {
            return node && typeof node === 'object' ? { holder: node, key: name } : null;
        }

        node = node?.[name];
        if (index !== undefined) node = node?.[Number(index)];
        if (node === undefined || node === null) return null;
    }

    return null;
}

/**
 * The field's array with English filled in, or null when there is nothing to
 * do — no French to translate from, or an English value already present.
 */
function withEnglish(field: unknown, english: string, replace = false): I18nEntry[] | null {
    if (!Array.isArray(field)) return null;

    const entries = field as I18nEntry[];
    const fr = entries.find((e) => e._key === 'fr');
    if (!fr?.value?.trim()) return null;

    const en = entries.find((e) => e._key === 'en');
    if (en?.value?.trim() && !replace) return null;
    if (en?.value === english) return null;

    // A new entry inherits the French one's `_type` — the internationalized
    // array plugin distinguishes its string and text members by it, and a
    // mismatch makes the field unreadable in the Studio.
    const next = entries.filter((e) => e._key !== 'en');
    next.push({ _key: 'en', _type: fr._type, value: english });
    return next;
}

/**
 * A whole internationalized array built from nothing, for a field the document
 * has never carried. Returns null once anything is there, so seeding is as
 * re-runnable as the rest.
 */
function seeded(field: unknown, copy: { fr: string; en: string }, text: boolean): I18nEntry[] | null {
    const entries = Array.isArray(field) ? (field as I18nEntry[]) : [];
    if (entries.some((e) => e.value?.trim())) return null;

    const type = text ? 'internationalizedArrayTextValue' : 'internationalizedArrayStringValue';
    return [
        { _key: 'fr', _type: type, value: copy.fr },
        { _key: 'en', _type: type, value: copy.en }
    ];
}

/** Which member type a seeded field takes, per its schema definition. */
const TEXT_FIELDS = new Set(['pageIntro', 'venueBody']);

// ── Run ─────────────────────────────────────────────────────────────────────

/**
 * Stage a resolved field onto the in-memory document and into the pending
 * patch. Arrays are rewritten whole rather than by element: an
 * internationalized entry may not exist yet, and `set` on a path that is not
 * there is a no-op.
 */
function stage(
    doc: any,
    found: { holder: any; key: string },
    next: I18nEntry[],
    path: string,
    patch: Record<string, unknown>,
    touched: string[],
    note: string
) {
    found.holder[found.key] = next;
    const root = path.split(/[.[]/)[0];
    patch[root] = doc[root];
    touched.push(note ? `${path}  (${note})` : path);
}

async function run() {
    let written = 0;
    let skipped = 0;

    // Every document any of the three maps mentions, so a document needing more
    // than one kind of change is fetched and patched once rather than twice.
    const ids = new Set([
        ...Object.keys(TRANSLATIONS),
        ...(FIX_LINE_BREAKS ? Object.keys(LINE_BREAK_FIXES) : []),
        ...(SEED ? Object.keys(SEEDS) : [])
    ]);

    for (const id of ids) {
        const doc = await client.getDocument(id);
        if (!doc) {
            console.warn(`! ${id}: no such document`);
            continue;
        }

        const replacements = FIX_LINE_BREAKS ? (LINE_BREAK_FIXES[id] ?? {}) : {};
        const english = { ...(TRANSLATIONS[id] ?? {}), ...replacements };
        const seeds = SEED ? (SEEDS[id] ?? {}) : {};

        // One patch per document, built from whichever fields still need it.
        const patch: Record<string, unknown> = {};
        const touched: string[] = [];

        for (const [path, value] of Object.entries(english)) {
            const found = locate(doc, path);
            if (!found) {
                console.warn(`! ${id}.${path}: no such field`);
                continue;
            }

            const next = withEnglish(found.holder[found.key], value, path in replacements);
            if (!next) {
                skipped++;
                continue;
            }

            stage(doc, found, next, path, patch, touched,
                path in replacements ? 'replaces existing English' : '');
            written++;
        }

        for (const [path, copy] of Object.entries(seeds)) {
            const found = locate(doc, path);
            if (!found) {
                console.warn(`! ${id}.${path}: no such field`);
                continue;
            }

            const next = seeded(found.holder[found.key], copy, TEXT_FIELDS.has(found.key));
            if (!next) {
                skipped++;
                continue;
            }

            stage(doc, found, next, path, patch, touched, 'new — FR and EN');
            written++;
        }

        if (!touched.length) {
            console.log(`= ${id}: nothing to add`);
            continue;
        }

        console.log(`${APPLY ? '+' : '~'} ${id}: ${touched.length} field(s)`);
        touched.forEach((p) => console.log(`    ${p}`));

        if (APPLY) await client.patch(id).set(patch).commit();
    }

    console.log(
        `\n${APPLY ? 'Wrote' : 'Would write'} ${written} field(s); ${skipped} already had content.`
    );
    if (!APPLY) console.log('Dry run — re-run with --apply to write.');
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
