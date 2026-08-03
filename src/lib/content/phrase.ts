/**
 * A lead-in phrase and what follows it — "Résultat : une clarté renforcée…",
 * "Notre ambition : du sens…", "L'objectif : incarner un leadership…".
 *
 * The copy is authored as one line and split at its first colon, so an editor
 * writes the sentence naturally and the emphasis follows from the punctuation
 * rather than from a second field they have to keep in step. A phrase with no
 * colon comes back entirely as `rest`, and renders as an ordinary sentence.
 */
export function splitLead(text: string): { lead: string; rest: string } {
    const at = text.indexOf(':');
    if (at === -1) return { lead: '', rest: text.trim() };
    return { lead: text.slice(0, at + 1).trim(), rest: text.slice(at + 1).trim() };
}
